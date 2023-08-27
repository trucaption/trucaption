import { DialogContentText, TextField } from '@mui/material';

import SettingsDialog from './SettingsDialog';

export default function AdvancedSettings(props) {
  const { updateConfig, onChangeFunction } = props;
  return (
    <SettingsDialog {...props} title="Advanced Settings">
      <DialogContentText sx={{ fontWeight: 'bold' }}>Ports</DialogContentText>
      <TextField
        label="Editor Port"
        margin="normal"
        variant="standard"
        fullWidth
        type="number"
        value={updateConfig.controller_port}
        required
        onChange={(event) =>
          onChangeFunction('controller_port', event.target.value)
        }
      />
      <TextField
        label="Viewer Port"
        margin="normal"
        variant="standard"
        fullWidth
        type="number"
        value={updateConfig.client_port}
        required
        onChange={(event) =>
          onChangeFunction('client_port', event.target.value)
        }
      />
      <DialogContentText>
        Note: Port changes require a restart to take effect.
      </DialogContentText>
    </SettingsDialog>
  );
}
