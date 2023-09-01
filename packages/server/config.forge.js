module.exports = {
  packagerConfig: {
    asar: false,
    osxSign: {
      optionsForFile: (filePath) => {
        return {
          entitlements: "entitlements.plist",
        };
      },
    },
  },
  makers: [
    {
      name: "@electron-forge/maker-squirrel",
      config: {
        name: "electron_quick_start",
      },
    },
    {
      name: "@electron-forge/maker-zip",
      platforms: ["darwin"],
    },
  ],
};
