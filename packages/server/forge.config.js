module.exports = {
  packagerConfig: {
    asar: true,
    derefSymlinks: true,
    icon: 'build/icon',
    osxSign: {
      optionsForFile: (filePath) => {
        return {
          entitlements: 'entitlements.plist',
        };
      },
    },
    osxNotarize: {
      tool: 'notarytool',
      keychain: process.env.NOTARY_KEYCHAIN,
      keychainProfile: process.env.NOTARY_PROFILE
    },
  },
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        signWithParams: ` /n "${process.env.SIGNING_ID}" /t ${process.env.TIMESTAMP_SERVER} /fd sha256`,
      },
    },
    {
      name: '@electron-forge/maker-dmg',
      config: {
        background: './build/dmg-background.png',
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
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin', 'linux'],
      config: {},
    },
  ],
  plugins: [
    {
      name: '@electron-forge/plugin-auto-unpack-natives',
      config: {},
    },
  ],
};
