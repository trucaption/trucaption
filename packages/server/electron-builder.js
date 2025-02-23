const config = {
  appId: "com.trucaption",
  productName: "Trucaption",
  mac: {
    "hardenedRuntime": true,
    target: [
      {
        target: "default",
        arch: [
          "universal"
        ]
      }
    ]
  },
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
      TimestampRfc3161: "http://timestamp.acs.microsoft.com",
      TimestampDigest: "SHA256",
    },
  },
  nsis: {
    shortcutName: "Trucaption",
    artifactName: "${productName}-${version}.${ext}",
  },
};
module.exports = config;
