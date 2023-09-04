import { DialogContentText, TextField } from '@mui/material';

import SettingsDialog from './SettingsDialog';

export default function AdvancedSettings(props) {
  const { configType, updateConfig, onChangeFunction } = props;
  return (
    <SettingsDialog {...props} title="Advanced Settings">
      <DialogContentText sx={{ fontWeight: 'bold' }}>Ports</DialogContentText>
      <TextField
        label="Editor Port"
        margin="normal"
        variant="standard"
        fullWidth
        type="number"
        value={updateConfig[configType].editor_port}
        required
        onChange={(event) =>
          onChangeFunction(configType, 'editor_port', event.target.value)
        }
      />
      <TextField
        label="Viewer Port"
        margin="normal"
        variant="standard"
        fullWidth
        type="number"
        value={updateConfig[configType].viewer_port}
        required
        onChange={(event) =>
          onChangeFunction(configType, 'viewer_port', event.target.value)
        }
      />
      <DialogContentText>
        Note: Port changes require a restart to take effect.
      </DialogContentText>
    </SettingsDialog>
  );
}
