/*
    Trucaption
    Copyright (C) 2023 Derek Kaser
    @license GPL-3.0-or-later
*/

const express = require("express");
const expressStaticGzip = require("express-static-gzip");
const path = require("path");

const { createServer } = require("http");

function runWebServer(DIST_DIR, port, localOnly = false) {
  const app = express();

  //Serving the files on the dist folder
  app.use("/", expressStaticGzip(DIST_DIR));

  //Send index.html when the user access the web
  app.get("/", function (req, res) {
    res.sendFile(path.join(DIST_DIR, "index.html"));
  });

  const http = createServer(app);
  http.listen(port, localOnly ? "127.0.0.1" : "0.0.0.0");

  console.log(`Serving ${DIST_DIR} on port ${port}`);

  return { AppServer: app, HttpServer: http };
}

module.exports = {
  runWebServer,
};
