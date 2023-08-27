import {
  Button,
  DialogContentText,
  MenuItem,
  Select,
  TextField,
} from '@mui/material';

import SettingsDialog from './SettingsDialog';

export default function TranscriptionSettings(props) {
  const { updateConfig, onChangeFunction, config, currentLanguage } = props;

  return (
    <SettingsDialog {...props} title="Transcription Settings">
      <Select
        value={updateConfig.api}
        label="Transcription Engine"
        fullWidth
        onChange={(event) => onChangeFunction('api', event.target.value)}
      >
        <MenuItem value="browser">Browser Native</MenuItem>
        <MenuItem value="azure">Azure</MenuItem>
        <MenuItem value="speechly">Speechly</MenuItem>
      </Select>
      {updateConfig.api === 'azure' && (
        <>
          <TextField
            label="Azure Region"
            margin="normal"
            variant="standard"
            fullWidth
            value={updateConfig.azure_region}
            required
            onChange={(event) =>
              onChangeFunction('azure_region', event.target.value)
            }
          />
          <TextField
            label="Azure Subscription Key"
            type="password"
            margin="normal"
            variant="standard"
            fullWidth
            required
            value={updateConfig.azure_subscription_key}
            onChange={(event) =>
              onChangeFunction('azure_subscription_key', event.target.value)
            }
          />
          <TextField
            label="Azure Endpoint ID"
            margin="normal"
            variant="standard"
            fullWidth
            value={updateConfig.azure_endpoint_id}
            onChange={(event) =>
              onChangeFunction('azure_endpoint_id', event.target.value)
            }
          />
        </>
      )}
      {config && config.api === 'azure' && updateConfig.api === 'azure' && (
        <>
          <DialogContentText>
            Default language: {updateConfig.language}
          </DialogContentText>
          <Button
            variant="text"
            onClick={(event) => onChangeFunction('language', currentLanguage)}
          >
            Set Current Language as Default
          </Button>
        </>
      )}
      {updateConfig.api === 'speechly' && (
        <>
          <TextField
            label="Speechly App"
            margin="normal"
            type="password"
            fullWidth
            variant="standard"
            required
            value={updateConfig.speechly_app}
            onChange={(event) =>
              onChangeFunction('speechly_app', event.target.value)
            }
          />
        </>
      )}
    </SettingsDialog>
  );
}
