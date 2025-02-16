/*
    Trucaption
    Copyright (C) 2023 Derek Kaser
    @license GPL-3.0-or-later
*/

import { BrowserWindow, app, shell } from "electron";
import log from "electron-log";

import electronUpdater from "electron-updater";

import express from "express";
import expressStaticGzip from "express-static-gzip";

import axios from "axios";

import bodyParser from "body-parser";

import { Server } from "socket.io";

import { CONFIG_SETTINGS } from "@trucaption/common";

import fs from "node:fs";
import path from "node:path";

import querystring from "node:querystring";
import ip from "ip";

import { createServer } from "node:http";
import RateLimit from "express-rate-limit";

import locale from "locale-codes";
import translate from "translate";

const config = {};
let clientIo = null;

function createWindow() {
  const win = new BrowserWindow({
    width: 300,
    height: 600,
  });

  const data = querystring.stringify({
    editorPort: config.app.editor_port,
    viewerPort: config.app.viewer_port,
    version: app.getVersion(),
    viewerIP: ip.address(),
  });

  win.loadURL(`http://localhost:${config.app.editor_port}/app/?${data}`);

  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });

  electronUpdater.autoUpdater.checkForUpdatesAndNotify();
}

function saveConfigToDisk(configType) {
  const configJson = path.join(
    app.getPath("userData"),
    CONFIG_SETTINGS[configType].file,
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
    app.getPath("userData"),
    CONFIG_SETTINGS[configType].file,
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
  loadConfig("app");
  loadConfig("display");
  loadConfig("transcription");
  loadConfig("translation");

  const { AppServer: clientApp, HttpServer: clientHttp } = runWebServer(
    path.join(__dirname, "../webpack/viewer"),
    config.app.viewer_port,
  );
  const { AppServer: controllerApp } = runWebServer(
    path.join(__dirname, "../webpack/editor"),
    config.app.editor_port,
    true,
  );

  // Set up client socket
  clientIo = new Server(clientHttp);

  // Set up Express API for controller interaction
  controllerApp.use(express.json());
  controllerApp.use(bodyParser.urlencoded({ extended: false }));

  controllerApp.get("/connect", getConnect);

  controllerApp.get("/config", getConfig);
  controllerApp.post("/config", postConfig);

  controllerApp.post("/message", postMessage);

  clientIo.of("/default");
  setupTranslation();

  createWindow();

  app.on("window-all-closed", () => {
    app.quit();
  });
}

function runWebServer(DIST_DIR, port, localOnly = false) {
  const app = express();

  const limiter = RateLimit({
    windowMs: 60 * 1000,
    max: 250,
  });

  //Serving the files on the dist folder
  app.use("/", limiter, expressStaticGzip(DIST_DIR));

  //Send index.html when the user access the web
  app.get("/", limiter, (req, res) => {
    res.sendFile(path.join(DIST_DIR, "index.html"));
  });

  app.get("/defaults", (request, response) => getDefaults(response, config));

  const http = createServer(app);
  http.listen(port, localOnly ? "127.0.0.1" : "0.0.0.0");

  log.log(`Serving ${DIST_DIR} on port ${port}`);

  return { AppServer: app, HttpServer: http };
}

function getDefaults(response, config) {
  try {
    response.send({
      topic: "",
      font_size: Number.parseInt(config.display.font_size),
      max_lines: Number.parseInt(config.display.max_lines),
      translation: {
        enabled: config.translation.enabled,
        languages: config.translation.languages,
      },
    });
  } catch (error) {
    log.error(error);
    response.status(500).end();
  }
}

function sanitizedConfig(configType) {
  const sanitized_config = Object.assign({}, config[configType]);

  for (const item of CONFIG_SETTINGS[configType].sensitive) {
    if (sanitized_config[item]) sanitized_config[item] = "defined";
  }

  return sanitized_config;
}

async function getConnect(request, response) {
  const responseJson = {};

  try {
    if (config.transcription.api === "azure") {
      const apiResponse = await axios({
        method: "post",
        url: `https://${config.transcription.azure_region}.api.cognitive.microsoft.com/sts/v1.0/issueToken?expiredTime=86400`,
        headers: {
          "Ocp-Apim-Subscription-Key":
            config.transcription.azure_subscription_key,
          "Content-length": 0,
          "Content-type": "application/x-www-form-urlencoded",
        },
      });

      const azureLanguagesResponse = await axios({
        method: "get",
        url: `https://${config.transcription.azure_region}.api.cognitive.microsoft.com/speechtotext/v3.1/evaluations/locales`,
        headers: {
          "Ocp-Apim-Subscription-Key":
            config.transcription.azure_subscription_key,
        },
      });

      responseJson.azureToken = apiResponse.data;
      responseJson.azureLanguages = azureLanguagesResponse.data;
    }

    if (config.transcription.api === "speechly") {
      responseJson.speechly_app = config.transcription.speechly_app;
    }

    response.send(responseJson);
  } catch (error) {
    log.error(`${error.message}`);
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

    const id = request.body.type;
    if (id === "__proto__" || id === "constructor" || id === "prototype") {
      response.end(403);
      return;
    }

    for (const item of CONFIG_SETTINGS[id].sensitive) {
      if (newConfig[item] === "defined") newConfig[item] = config[id][item];
    }

    if (id === "display") {
      newConfig.font_size = Number.parseInt(newConfig.font_size);
      newConfig.max_lines = Number.parseInt(newConfig.max_lines);
    }

    if (id === "app") {
      newConfig.editor_port = Number.parseInt(newConfig.editor_port);
      newConfig.viewer_port = Number.parseInt(newConfig.viewer_port);
    }

    Object.assign(config[id], newConfig);
    saveConfigToDisk(id);
    response.status(201).end();

    if (id === "translation") {
      setupTranslation();
    }
  } catch (error) {
    log.error(error);
    response.status(500).end();
  }
}

function postMessage(request, response) {
  try {
    clientIo.of("/default").emit(request.body.queue, request.body.data);
    response.status(201).end();

    if (
      config.translation.enabled &&
      (request.body.queue === "final" ||
        (request.body.queue === "temp" && config.translation.interim))
    ) {
      for (const lang of config.translation.languages) {
        translateMessage(
          request.body.language,
          lang,
          request.body.data,
          request.body.queue,
        );
      }
    }
  } catch (error) {
    log.error(error);
    response.status(500).end();
  }
}

function logConnection(request, message) {
  log.debug(`[${request.socket.remoteAddress}] ${message}`);
}

function setupTranslation() {
  if (config.translation.enabled) {
    if (config.translation.key) {
      log.log("Enabling translation");
      translate.engine = config.translation.api;
      translate.key = config.translation.key;

      if (config.translation.enabled) {
        for (const lang of config.translation.languages) {
          // Initialize namespace for language
          clientIo.of(`/${lang}`);
        }
      }
    } else {
      log.log("Translation enabled, but key not specified -- disabling.");
      config.translation.enabled = false;
      saveConfigToDisk("translation");
    }
  } else {
    log.log("Translation disabled.");
  }
}

async function translateMessage(
  currentLanguage,
  targetLanguage,
  message,
  queue,
) {
  try {
    const current = locale.getByTag(currentLanguage);
    const target = locale.getByTag(targetLanguage);

    if (current["iso639-1"] === target["iso639-1"]) {
      clientIo.of(`/${targetLanguage}`).emit(queue, JSON.stringify(message));
      return;
    }

    const data = JSON.parse(message);
    if (data.text) {
      data.text = await translate(data.text, targetLanguage);
    }

    clientIo.of(`/${targetLanguage}`).emit(queue, JSON.stringify(data));
  } catch (error) {
    log.error(error);
  }
}
