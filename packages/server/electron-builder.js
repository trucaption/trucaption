const config = {
  appId: "com.trucaption",
  productName: "Trucaption",
  win: {
    target: [
      {
        target: "nsis",
        arch: ["x64"],
      },
    ],
    azureSignOptions: {
      endpoint: process.env.AZURE_SIGN_ENDPOINT,
      codeSigningAccountName: process.env.AZURE_SIGN_ACCOUNT_NAME,
      certificateProfileName: process.env.AZURE_CERT_PROFILE_NAME,
    },
  },
  nsis: {
    shortcutName: "Trucaption",
  },
};
module.exports = config;
