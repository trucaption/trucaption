/*
    Trucaption
    Copyright (C) 2023 Derek Kaser
    @license GPL-3.0-or-later
*/

const express = require('express');
const axios = require('axios');
const { urlencoded } = require('body-parser');

const expressStaticGzip = require('express-static-gzip');

const { Server } = require('socket.io');

const fs = require('fs');
const path = require('path');

const ip = require('ip');

const { createServer } = require('http');
const open = require('open');

const configJson = path.join(process.env.PWD, 'config.json');

const app_config = {};

function saveConfigToDisk() {
  fs.writeFileSync(configJson, JSON.stringify(app_config, null, 2));
}

function updateConfig(key, value) {
  if (key in app_config) {
    app_config[key] = value;
  }
}

async function runServer() {
  const { DEFAULT_CONFIG } = await import('@trucaption/common');
  Object.assign(app_config, DEFAULT_CONFIG);

  if (fs.existsSync(configJson)) {
    const json_config = JSON.parse(fs.readFileSync(configJson));
    for (const [key, value] of Object.entries(json_config)) {
      updateConfig(key, value);
    }
  }

  saveConfigToDisk();

  const { AppServer: clientApp, HttpServer: clientHttp } = runWebServer(
    path.join(__dirname, '../webpack/viewer'),
    app_config.client_port
  );
  const { AppServer: controllerApp } = runWebServer(
    path.join(__dirname, '../webpack/editor'),
    app_config.controller_port,
    true
  );

  // Set up defaults
  controllerApp.get('/defaults', (request, response) =>
    sendDefaults(response, app_config)
  );
  clientApp.get('/defaults', (request, response) =>
    sendDefaults(response, app_config)
  );

  // Set up client socket
  const clientIo = new Server(clientHttp);

  // Set up Express API for controller interaction
  controllerApp.use(express.json());
  controllerApp.use(urlencoded({ extended: false }));

  controllerApp.get('/connect', async (request, response) => {
    let azureToken = '';
    const api = app_config.api;

    if (api === 'azure') {
      const apiResponse = await axios({
        method: 'post',
        url: `https://${app_config.azure_region}.api.cognitive.microsoft.com/sts/v1.0/issueToken?expiredTime=86400`,
        headers: {
          'Ocp-Apim-Subscription-Key': app_config.azure_subscription_key,
          'Content-length': 0,
          'Content-type': 'application/x-www-form-urlencoded',
        },
      });
      azureToken = apiResponse.data;
    }

    response.send({
      api: api,
      server_ip: ip.address(),
      client_port: app_config.client_port,
      clear_temp_on_stop: app_config.clear_temp_on_stop,
      azure_token: api === 'azure' ? azureToken : '',
      azure_region: api === 'azure' ? app_config.azure_region : '',
      azure_endpoint_id: api === 'azure' ? app_config.azure_endpoint_id : '',
      speechly_app: api === 'speechly' ? app_config.speechly_app : '',
    });
  });

  controllerApp.get('/config', async (request, response) => {
    const sanitized_config = Object.assign({}, app_config);
    if (sanitized_config.azure_subscription_key)
      sanitized_config.azure_subscription_key = 'defined';
    if (sanitized_config.speechly_app)
      sanitized_config.speechly_app = 'defined';
    response.send(sanitized_config);
  });

  controllerApp.post('/config', async (request, response) => {
    try {
      const newConfig = Object.assign({}, request.body);

      if (newConfig.azure_subscription_key === 'defined') {
        newConfig.azure_subscription_key = app_config.azure_subscription_key;
      }

      if (newConfig.speechly_app === 'defined')
        newConfig.speechly_app = app_config.speechly_app;

      newConfig.font_size = Number.parseInt(newConfig.font_size);
      newConfig.max_lines = Number.parseInt(newConfig.max_lines);
      newConfig.controller_port = Number.parseInt(newConfig.controller_port);
      newConfig.client_port = Number.parseInt(newConfig.client_port);

      Object.assign(app_config, newConfig);
      saveConfigToDisk();
      response.status(201).end();
    } catch (error) {
      console.error(error);
      response.status(500).end();
    }
  });

  controllerApp.post('/message', (request, response) => {
    try {
      clientIo
        .of(`/${request.body.room}`)
        .emit(request.body.queue, request.body.data);
      response.status(201).end();
    } catch (error) {
      console.log(error);
    }
  });

  open(`http://localhost:${app_config.controller_port}`);
}

function runWebServer(DIST_DIR, port, localOnly = false) {
  const app = express();

  //Serving the files on the dist folder
  app.use('/', expressStaticGzip(DIST_DIR));

  //Send index.html when the user access the web
  app.get('/', function (req, res) {
    res.sendFile(path.join(DIST_DIR, 'index.html'));
  });

  const http = createServer(app);
  http.listen(port, localOnly ? '127.0.0.1' : '0.0.0.0');

  console.log(`Serving ${DIST_DIR} on port ${port}`);

  return { AppServer: app, HttpServer: http };
}

function sendDefaults(response, config) {
  response.send({
    topic: app_config.topic,
    font_size: parseInt(app_config.font_size),
    max_lines: parseInt(app_config.max_lines),
  });
}

runServer();
