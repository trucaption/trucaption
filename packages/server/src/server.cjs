
const { app } = require('electron');
const log = require('electron-log');

async function run()
{
  const { runServer } = await import("./server.mjs");
  await app.whenReady();

  runServer(__dirname).catch((error) => {
    log.error(error);
  });
}

run();
