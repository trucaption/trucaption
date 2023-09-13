/*
    Trucaption
    Copyright (C) 2023 Derek Kaser
    @license GPL-3.0-or-later
*/

import { app, BrowserWindow, shell } from 'electron';
import log from 'electron-log';

import electronUpdater from "electron-updater"

import express from 'express';
import expressStaticGzip from 'express-static-gzip';

import axios from 'axios';

import bodyParser from 'body-parser';

import { Server } from 'socket.io';

import { CONFIG_SETTINGS } from '@trucaption/common';

import fs from 'fs';
import path from 'path';

import ip from 'ip';
import querystring from 'querystring';

import { createServer } from 'http';

const config = {};
var clientIo = null;

function createWindow() {
  const win = new BrowserWindow({
    width: 300,
    height: 600,
  });

  const data = querystring.stringify({
    editorPort: config['app'].editor_port,
    viewerPort: config['app'].viewer_port,
    version: app.getVersion(),
    viewerIP: ip.address(),
  });

  win.loadURL(`http://localhost:${config['app'].editor_port}/app/?${data}`);

  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  electronUpdater.autoUpdater.checkForUpdatesAndNotify();
}

function saveConfigToDisk(configType) {
  const configJson = path.join(
    app.getPath('userData'),
    CONFIG_SETTINGS[configType].file
  );
  fs.writeFileSync(configJson, JSON.stringify(config[configType], null, 2));
}

function updateConfig(configObject, key, value) {
  if (key in configObject) {
    configObject[key] = value;
  }
}

function loadConfig(configType) {
  config[configType] = Object.assign({}, CONFIG_SETTINGS[configType].defaults);

  const configJson = path.join(
    app.getPath('userData'),
    CONFIG_SETTINGS[configType].file
  );

  if (fs.existsSync(configJson)) {
    const json_config = JSON.parse(fs.readFileSync(configJson));
    for (const [key, value] of Object.entries(json_config)) {
      updateConfig(config[configType], key, value);
    }
  }

  saveConfigToDisk(configType);
}

export async function runServer(__dirname) {
  // Load configuration objects
  loadConfig('app');
  loadConfig('display');
  loadConfig('transcription');
  loadConfig('translation');

  const { AppServer: clientApp, HttpServer: clientHttp } = runWebServer(
    path.join(__dirname, '../webpack/viewer'),
    config['app'].viewer_port
  );
  const { AppServer: controllerApp } = runWebServer(
    path.join(__dirname, '../webpack/editor'),
    config['app'].editor_port,
    true
  );

  // Set up client socket
  clientIo = new Server(clientHttp);

  // Set up Express API for controller interaction
  controllerApp.use(express.json());
  controllerApp.use(bodyParser.urlencoded({ extended: false }));

  controllerApp.get('/connect', getConnect);

  controllerApp.get('/config', getConfig);
  controllerApp.post('/config', postConfig);

  controllerApp.post('/message', postMessage);

  createWindow();

  app.on('window-all-closed', () => {
    app.quit();
  });
}

function runWebServer(DIST_DIR, port, localOnly = false) {
  const app = express();

  //Serving the files on the dist folder
  app.use('/', expressStaticGzip(DIST_DIR));

  //Send index.html when the user access the web
  app.get('/', function (req, res) {
    res.sendFile(path.join(DIST_DIR, 'index.html'));
  });

  app.get('/defaults', (request, response) => getDefaults(response, config));

  const http = createServer(app);
  http.listen(port, localOnly ? '127.0.0.1' : '0.0.0.0');

  log.log(`Serving ${DIST_DIR} on port ${port}`);

  return { AppServer: app, HttpServer: http };
}

function getDefaults(response, config) {
  try {
    response.send({
      topic: '',
      font_size: parseInt(config['display'].font_size),
      max_lines: parseInt(config['display'].max_lines),
      translation: {
        enabled: config['translation'].enabled,
        languages: config['translation'].languages,
      },
    });
  } catch (error) {
    log.error(error);
    response.status(500).end();
  }
}

function sanitizedConfig(configType) {
  const sanitized_config = Object.assign({}, config[configType]);

  CONFIG_SETTINGS[configType].sensitive.forEach((item) => {
    if (sanitized_config[item]) sanitized_config[item] = 'defined';
  });

  return sanitized_config;
}

async function getConnect(request, response) {
  const responseJson = {};

  try {
    if (config['transcription'].api === 'azure') {
      const apiResponse = await axios({
        method: 'post',
        url: `https://${config['transcription'].azure_region}.api.cognitive.microsoft.com/sts/v1.0/issueToken?expiredTime=86400`,
        headers: {
          'Ocp-Apim-Subscription-Key':
            config['transcription'].azure_subscription_key,
          'Content-length': 0,
          'Content-type': 'application/x-www-form-urlencoded',
        },
      });

      const azureLanguagesResponse = await axios({
        method: 'get',
        url: `https://${config['transcription'].azure_region}.api.cognitive.microsoft.com/speechtotext/v3.1/evaluations/locales`,
        headers: {
          'Ocp-Apim-Subscription-Key':
            config['transcription'].azure_subscription_key,
        },
      });

      responseJson['azureToken'] = apiResponse.data;
      responseJson['azureLanguages'] = azureLanguagesResponse.data;
    }

    if (config['transcription'].api === 'speechly') {
      responseJson['speechly_app'] = config['transcription'].speechly_app;
    }

    response.send(responseJson);
  } catch (error) {
    log.log(`${error.message}`);
    response.status(500).end();
  }
}

function getConfig(request, response) {
  try {
    logConnection(request, `Received config GET for ${request.query.config}`);
    response.send(sanitizedConfig(request.query.config));
  } catch (error) {
    log.error(error);
    response.status(500).end();
  }
}

function postConfig(request, response) {
  try {
    logConnection(request, `Received config POST for ${request.body.type}`);
    const newConfig = Object.assign({}, request.body.config);

    CONFIG_SETTINGS[request.body.type].sensitive.forEach((item) => {
      if (newConfig[item] === 'defined')
        newConfig[item] = config[request.body.type][item];
    });

    if (request.body.type === 'display') {
      newConfig.font_size = Number.parseInt(newConfig.font_size);
      newConfig.max_lines = Number.parseInt(newConfig.max_lines);
    }

    if (request.body.type === 'app') {
      newConfig.editor_port = Number.parseInt(newConfig.editor_port);
      newConfig.viewer_port = Number.parseInt(newConfig.viewer_port);
    }

    Object.assign(config[request.body.type], newConfig);
    saveConfigToDisk(request.body.type);
    response.status(201).end();
  } catch (error) {
    log.error(error);
    response.status(500).end();
  }
}

function postMessage(request, response) {
  try {
    clientIo
      .of(`/${request.body.room}`)
      .emit(request.body.queue, request.body.data);
    response.status(201).end();
  } catch (error) {
    log.log(error);
    response.status(500).end();
  }
}

function logConnection(request, message) {
  log.debug(`[${request.socket.remoteAddress}] ${message}`);
}
