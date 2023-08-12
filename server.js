/*
    Trucaption
    Copyright (C) 2023 Derek Kaser
    @license GPL-3.0-or-later
*/

const express = require("express");
const axios = require("axios");
const { urlencoded } = require("body-parser");

const { Server } = require("socket.io");

const DEFAULT_CONFIG = require("./src/include/config.default.json");
const { runWebServer, sendDefaults } = require("./src/include/WebServer");

const path = require("path");
const nconf = require("nconf");

const open = require("open");

const ip = require("ip");

// Get configuration:
const configPath = path.join(process.cwd(), "config.ini");
nconf
  .argv()
  .env({
    parseValues: true,
    transform: function (obj) {
      if (!obj.key.toLowerCase().startsWith("trucaption_")) return false;

      obj.key = obj.key.toLowerCase().substring(11);
      console.log(`Found environment variable: ${obj.key}`);
      return obj;
    },
  })
  .file({ file: configPath, format: nconf.formats.ini })
  .defaults(DEFAULT_CONFIG);

const { AppServer: clientApp, HttpServer: clientHttp } = runWebServer(
  path.join(__dirname, "webpack/client"),
  nconf.get("client_port"),
);
const { AppServer: controllerApp } = runWebServer(
  path.join(__dirname, "webpack/controller"),
  nconf.get("controller_port"),
  true,
);

// Set up defaults
controllerApp.get("/defaults", (request, response) =>
  sendDefaults(response, nconf),
);
clientApp.get("/defaults", (request, response) =>
  sendDefaults(response, nconf),
);

// Set up client socket
const clientIo = new Server(clientHttp);

// Set up Express API for controller interaction
controllerApp.use(express.json());
controllerApp.use(urlencoded({ extended: false }));

controllerApp.get("/config", async (request, response) => {
  let azureToken = "";
  const api = nconf.get("api");

  if (api === "azure") {
    const apiResponse = await axios({
      method: "post",
      url: `https://${nconf.get(
        "azure_region",
      )}.api.cognitive.microsoft.com/sts/v1.0/issueToken?expiredTime=86400`,
      headers: {
        "Ocp-Apim-Subscription-Key": nconf.get("azure_subscription_key"),
        "Content-length": 0,
        "Content-type": "application/x-www-form-urlencoded",
      },
    });
    azureToken = apiResponse.data;
  }

  response.send({
    api: api,
    server_ip: ip.address(),
    client_port: nconf.get("client_port"),
    clear_temp_on_stop: nconf.get("clear_temp_on_stop"),
    azure_token: api === "azure" ? azureToken : "",
    azure_region: api === "azure" ? nconf.get("azure_region") : "",
    speechly_app: api === "speechly" ? nconf.get("speechly_app") : "",
  });
});

controllerApp.post("/message", (request, response) => {
  try {
    clientIo
      .of(`/${request.body.room}`)
      .emit(request.body.queue, request.body.data);
    response.status(201).end();
  } catch (error) {
    console.log(error);
  }
});

open("http://localhost:8080");
