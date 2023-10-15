import {
  Button,
  Chip,
  DialogContentText,
  Divider,
  MenuItem,
  Select,
  Stack,
  TextField,
} from "@mui/material";

import { useState } from "react";

import SettingsDialog from "./SettingsDialog";

import locale from "locale-codes";

import { useTranslation } from "react-i18next";

import BadWordsDictionaries from "../BadWordsDictionaries.mjs";

function handleDelete(chipToDelete, allowed_languages) {
  const newArray = allowed_languages.filter((chip) => chip !== chipToDelete);
  console.log(chipToDelete);
  console.log(allowed_languages);
  console.log(newArray);
  return newArray;
}

export default function TranscriptionSettings(props) {
  const {
    configType,
    updateConfig,
    onChangeFunction,
    config,
    currentLanguage,
    allowedLanguages,
    loggedIn,
  } = props;

  const [languageSelect, setLanguageSelect] = useState("");
  const { t } = useTranslation();

  return (
    <SettingsDialog {...props} title={t("editor.transcriptionSettings")}>
      <Select
        value={updateConfig[configType].api}
        label={t("editor.settings.engine")}
        fullWidth
        onChange={(event) =>
          onChangeFunction(configType, "api", event.target.value)
        }
      >
        <MenuItem value="browser">
          {t("editor.settings.transcription.browser")}
        </MenuItem>
        <MenuItem value="azure">Azure</MenuItem>
        <MenuItem value="speechly">Speechly</MenuItem>
      </Select>
      {updateConfig[configType].api === "azure" && (
        <>
          <TextField
            label={t("editor.settings.transcription.azureRegion")}
            margin="normal"
            variant="standard"
            fullWidth
            value={updateConfig[configType].azure_region}
            required
            onChange={(event) =>
              onChangeFunction(configType, "azure_region", event.target.value)
            }
          />
          <TextField
            label={t("editor.settings.transcription.azureKey")}
            type="password"
            margin="normal"
            variant="standard"
            fullWidth
            required
            value={updateConfig[configType].azure_subscription_key}
            onChange={(event) =>
              onChangeFunction(
                configType,
                "azure_subscription_key",
                event.target.value,
              )
            }
          />
          <TextField
            label={t("editor.settings.transcription.azureEndpoint")}
            margin="normal"
            variant="standard"
            fullWidth
            value={updateConfig[configType].azure_endpoint_id}
            onChange={(event) =>
              onChangeFunction(
                configType,
                "azure_endpoint_id",
                event.target.value,
              )
            }
          />
        </>
      )}
      {(loggedIn &&
        config[configType].api === "azure" &&
        updateConfig[configType].api === "azure" && (
          <>
            <DialogContentText>
              {t("editor.settings.transcription.allowedLanguages")}:
            </DialogContentText>
            <Stack direction="row" spacing={1}>
              {updateConfig[configType].allowed_languages.map((data) => {
                return (
                  <>
                    <Chip
                      label={data}
                      onDelete={(event) => {
                        onChangeFunction(
                          configType,
                          "allowed_languages",
                          handleDelete(
                            data,
                            updateConfig[configType].allowed_languages,
                          ),
                        );
                      }}
                    />
                  </>
                );
              })}
            </Stack>
            <Select
              value={languageSelect}
              label={t("editor.settings.language")}
              variant="standard"
              onChange={(e) => {
                setLanguageSelect(e.target.value);
              }}
            >
              {allowedLanguages.map((item) => {
                const loc = locale.getByTag(item);
                if (
                  loc &&
                  loc["iso639-1"] in BadWordsDictionaries &&
                  !updateConfig[configType].allowed_languages.includes(item)
                )
                  return (
                    <MenuItem value={item} key={item}>
                      {loc.name} ({loc.location})
                    </MenuItem>
                  );
              })}
            </Select>
            <Button
              variant="text"
              onClick={(event) => {
                if (
                  !updateConfig[configType].allowed_languages.includes(
                    languageSelect,
                  )
                ) {
                  onChangeFunction(
                    configType,
                    "allowed_languages",
                    updateConfig[configType].allowed_languages.concat(
                      languageSelect,
                    ),
                  );
                }
              }}
            >
              {t("editor.settings.addLanguage")}
            </Button>

            <Divider />
            <DialogContentText>
              {t("editor.settings.transcription.defaultLanguage")}:{" "}
              {updateConfig[configType].language}
            </DialogContentText>
            <Button
              variant="text"
              onClick={(event) =>
                onChangeFunction(configType, "language", currentLanguage)
              }
            >
              {t("editor.settings.transcription.setCurrentDefault")}
            </Button>
          </>
        )) || (
        <>
          <DialogContentText>
            {t("editor.settings.transcription.languageAzureConnected")}
          </DialogContentText>
        </>
      )}
      {updateConfig[configType].api === "speechly" && (
        <>
          <TextField
            label={t("editor.settings.transcription.speechlyApp")}
            margin="normal"
            type="password"
            fullWidth
            variant="standard"
            required
            value={updateConfig[configType].speechly_app}
            onChange={(event) =>
              onChangeFunction(configType, "speechly_app", event.target.value)
            }
          />
        </>
      )}
    </SettingsDialog>
  );
}
