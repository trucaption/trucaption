import { DialogContentText, TextField } from "@mui/material";

import { useTranslation } from "react-i18next";

import SettingsDialog from "./SettingsDialog";

export default function AdvancedSettings(props) {
  const { configType, updateConfig, onChangeFunction } = props;
  const { t } = useTranslation();

  return (
    <SettingsDialog {...props} title={t("editor.advancedSettings")}>
      <DialogContentText sx={{ fontWeight: "bold" }}>
        {t("editor.settings.advanced.ports")}
      </DialogContentText>
      <TextField
        label={t("editor.settings.advanced.editorPort")}
        margin="normal"
        variant="standard"
        fullWidth
        type="number"
        value={updateConfig[configType].editor_port}
        required
        onChange={(event) =>
          onChangeFunction(configType, "editor_port", event.target.value)
        }
      />
      <TextField
        label={t("editor.settings.advanced.viewerPort")}
        margin="normal"
        variant="standard"
        fullWidth
        type="number"
        value={updateConfig[configType].viewer_port}
        required
        onChange={(event) =>
          onChangeFunction(configType, "viewer_port", event.target.value)
        }
      />
      <DialogContentText>
        {t("editor.settings.advanced.message")}
      </DialogContentText>
    </SettingsDialog>
  );
}
