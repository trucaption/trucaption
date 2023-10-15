import { FormControlLabel, Switch, TextField } from "@mui/material";

import { useTranslation } from "react-i18next";

import SettingsDialog from "./SettingsDialog";

export default function DisplaySettings(props) {
  const { configType, updateConfig, onChangeFunction } = props;
  const { t } = useTranslation();

  return (
    <SettingsDialog {...props} title={t("editor.displaySettings")}>
      <TextField
        label={t("editor.settings.display.maxLines")}
        margin="normal"
        variant="standard"
        fullWidth
        type="number"
        value={updateConfig[configType].max_lines}
        required
        onChange={(event) =>
          onChangeFunction(configType, "max_lines", event.target.value)
        }
      />
      <TextField
        label={t("editor.settings.display.defaultFontSize")}
        margin="normal"
        variant="standard"
        fullWidth
        type="number"
        value={updateConfig[configType].font_size}
        required
        onChange={(event) =>
          onChangeFunction(configType, "font_size", event.target.value)
        }
      />
      <FormControlLabel
        control={
          <Switch
            checked={updateConfig[configType].clear_temp_on_stop}
            onChange={(event) =>
              onChangeFunction(
                configType,
                "clear_temp_on_stop",
                event.target.checked,
              )
            }
          />
        }
        label={t("editor.settings.display.clearTemp")}
      />
      <FormControlLabel
        control={
          <Switch
            checked={updateConfig[configType].word_filter}
            onChange={(event) =>
              onChangeFunction(configType, "word_filter", event.target.checked)
            }
          />
        }
        label={t("editor.settings.display.wordFilter")}
      />
      <FormControlLabel
        control={
          <Switch
            checked={updateConfig[configType].all_caps}
            onChange={(event) =>
              onChangeFunction(configType, "all_caps", event.target.checked)
            }
          />
        }
        label={t("editor.settings.display.allCaps")}
      />
    </SettingsDialog>
  );
}
