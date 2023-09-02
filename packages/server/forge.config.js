module.exports = {
  packagerConfig: {
    asar: true,
    derefSymlinks: true,
    icon: 'build/icon',
    osxSign: {
      identity: process.env.SIGNING_ID,
      optionsForFile: (filePath) => {
        return {
          entitlements: 'entitlements.plist',
        };
      },
    },
  },
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {},
    },
    {
      name: '@electron-forge/maker-dmg',
      config: {
        background: './build/dmg-background.png',
        additionalDMGOptions: {
          'background-color': 'yellow'
        }
      },
    },
    {
      name: '@electron-forge/maker-deb',
      config: {},
    },
    {
      name: '@electron-forge/maker-snap',
      config: {
        features: {
          browserSandbox: true,
        },
      },
    },
  ],
  plugins: [
    {
      name: '@electron-forge/plugin-auto-unpack-natives',
      config: {},
    },
  ],
};
