
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

if (require('electron-squirrel-startup')) app.quit();

require('update-electron-app')({
  logger: log,
});

run();
