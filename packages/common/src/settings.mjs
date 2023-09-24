export const configSettings = {
  app: {
    defaults: {
      editor_port: 8080,
      viewer_port: 80,
    },
    sensitive: [],
    file: "app.json",
  },
  display: {
    defaults: {
      font_size: 20,
      max_lines: -1,
      clear_temp_on_stop: false,
      word_filter: true,
      all_caps: false,
    },
    sensitive: [],
    file: "display.json",
  },
  transcription: {
    defaults: {
      api: "browser",
      allowed_languages: [],
      azure_endpoint_id: "",
      azure_region: "",
      azure_subscription_key: "",
      language: "en-US",
      speechly_app: "",
    },
    sensitive: ["azure_subscription_key", "speechly_app"],
    file: "transcription.json",
  },
  translation: {
    defaults: {
      enabled: false,
      interim: false,
      languages: [],
      api: "google",
      key: "",
    },
    sensitive: ["key"],
    file: "translation.json",
  },
};
