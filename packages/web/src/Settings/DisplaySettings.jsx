import { FormControlLabel, Switch, TextField } from '@mui/material';

import SettingsDialog from './SettingsDialog';

export default function DisplaySettings(props) {
  const { updateConfig, onChangeFunction } = props;

  return (
    <SettingsDialog {...props} title="Display Settings">
      <TextField
        label="Maximum Lines"
        margin="normal"
        variant="standard"
        fullWidth
        type="number"
        value={updateConfig.max_lines}
        required
        onChange={(event) => onChangeFunction('max_lines', event.target.value)}
      />
      <TextField
        label="Default Font Size"
        margin="normal"
        variant="standard"
        fullWidth
        type="number"
        value={updateConfig.font_size}
        required
        onChange={(event) => onChangeFunction('font_size', event.target.value)}
      />
      <FormControlLabel
        control={
          <Switch
            checked={updateConfig.clear_temp_on_stop}
            onChange={(event) =>
              onChangeFunction('clear_temp_on_stop', event.target.checked)
            }
          />
        }
        label="Clear temporary transcript on stop"
      />
      <FormControlLabel
        control={
          <Switch
            checked={updateConfig.word_filter}
            onChange={(event) =>
              onChangeFunction('word_filter', event.target.checked)
            }
          />
        }
        label="Use word filter"
      />
      <FormControlLabel
        control={
          <Switch
            checked={updateConfig.all_caps}
            onChange={(event) =>
              onChangeFunction('all_caps', event.target.checked)
            }
          />
        }
        label="Display text in all caps"
      />
    </SettingsDialog>
  );
}
