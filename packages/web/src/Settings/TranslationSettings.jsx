import {
  Button,
  Chip,
  DialogContentText,
  Divider,
  FormControlLabel,
  MenuItem,
  Select,
  Stack,
  Switch,
  TextField,
} from "@mui/material";

import { useState } from "react";

import { useTranslation } from "react-i18next";

import SettingsDialog from "./SettingsDialog";

import locale from "locale-codes";

function handleDelete(chipToDelete, allowed_languages) {
  const newArray = allowed_languages.filter((chip) => chip !== chipToDelete);
  console.log(chipToDelete);
  console.log(allowed_languages);
  console.log(newArray);
  return newArray;
}

export default function TranslationSettings(props) {
  const { configType, updateConfig, onChangeFunction } = props;
  const { t } = useTranslation();

  const [languageSelect, setLanguageSelect] = useState("");
  const allowedLanguages = GoogleLanguages;

  return (
    <SettingsDialog {...props} title={t("editor.translationSettings")}>
      <FormControlLabel
        control={
          <Switch
            checked={updateConfig[configType].enabled}
            onChange={(event) =>
              onChangeFunction(configType, "enabled", event.target.checked)
            }
          />
        }
        label={t("editor.settings.translation.enabled")}
      />
      {updateConfig[configType].enabled && (
        <>
          <Select
            value={updateConfig[configType].api}
            label={t("editor.settings.engine")}
            fullWidth
            onChange={(event) =>
              onChangeFunction(configType, "api", event.target.value)
            }
          >
            <MenuItem value="google">Google</MenuItem>
          </Select>
          <TextField
            label={t("editor.settings.translation.apiKey")}
            type="password"
            margin="normal"
            variant="standard"
            fullWidth
            required
            value={updateConfig[configType].key}
            onChange={(event) =>
              onChangeFunction(configType, "key", event.target.value)
            }
          />
          <FormControlLabel
            control={
              <Switch
                checked={updateConfig[configType].interim}
                onChange={(event) =>
                  onChangeFunction(configType, "interim", event.target.checked)
                }
              />
            }
            label={t("editor.settings.translation.interim")}
          />
          <DialogContentText>
            {t("editor.settings.translation.languages")}:
          </DialogContentText>
          <Stack direction="row" spacing={1}>
            {updateConfig[configType].languages.map((data) => {
              return (
                <>
                  <Chip
                    key={data}
                    label={data}
                    onDelete={(event) => {
                      onChangeFunction(
                        configType,
                        "languages",
                        handleDelete(data, updateConfig[configType].languages),
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
              if (loc && !updateConfig[configType].languages.includes(item))
                return (
                  <MenuItem value={item} key={item}>
                    {loc.name}
                  </MenuItem>
                );
            })}
          </Select>
          <Button
            variant="text"
            onClick={(event) => {
              if (
                !updateConfig[configType].languages.includes(languageSelect)
              ) {
                onChangeFunction(
                  configType,
                  "languages",
                  updateConfig[configType].languages.concat(languageSelect),
                );
              }
            }}
          >
            {t("editor.settings.addLanguage")}
          </Button>
        </>
      )}
    </SettingsDialog>
  );
}

const GoogleLanguages = [
  "af",
  "sq",
  "am",
  "ar",
  "hy",
  "as",
  "ay",
  "az",
  "bm",
  "eu",
  "be",
  "bn",
  "bho",
  "bs",
  "bg",
  "ca",
  "ceb",
  "zh-CN",
  "zh-TW",
  "co",
  "hr",
  "cs",
  "da",
  "dv",
  "doi",
  "nl",
  "en",
  "eo",
  "et",
  "ee",
  "fil",
  "fi",
  "fr",
  "fy",
  "gl",
  "ka",
  "de",
  "el",
  "gn",
  "gu",
  "ht",
  "ha",
  "haw",
  "he",
  "hi",
  "hmn",
  "hu",
  "is",
  "ig",
  "ilo",
  "id",
  "ga",
  "it",
  "ja",
  "jv",
  "kn",
  "kk",
  "km",
  "rw",
  "gom",
  "ko",
  "kri",
  "ku",
  "ckb",
  "ky",
  "lo",
  "la",
  "lv",
  "ln",
  "lt",
  "lg",
  "lb",
  "mk",
  "mai",
  "mg",
  "ms",
  "ml",
  "mt",
  "mi",
  "mr",
  "lus",
  "mn",
  "my",
  "ne",
  "no",
  "ny",
  "or",
  "om",
  "ps",
  "fa",
  "pl",
  "pt",
  "pa",
  "qu",
  "ro",
  "ru",
  "sm",
  "sa",
  "gd",
  "nso",
  "sr",
  "st",
  "sn",
  "sd",
  "si",
  "sk",
  "sl",
  "so",
  "es",
  "su",
  "sw",
  "sv",
  "tl",
  "tg",
  "ta",
  "tt",
  "te",
  "th",
  "ti",
  "ts",
  "tr",
  "tk",
  "ak",
  "uk",
  "ur",
  "ug",
  "uz",
  "vi",
  "cy",
  "xh",
  "yi",
  "yo",
  "zu",
];
