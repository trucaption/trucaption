import {
  Button,
  Chip,
  DialogContentText,
  Divider,
  MenuItem,
  Select,
  Stack,
  TextField,
} from '@mui/material';

import { useState } from 'react';

import SettingsDialog from './SettingsDialog';

import locale from 'locale-codes';

import BadWordsDictionaries from '../BadWordsDictionaries.mjs';

function handleDelete(chipToDelete, allowed_languages) {
  const newArray = allowed_languages.filter((chip) => chip !== chipToDelete);
  console.log(chipToDelete);
  console.log(allowed_languages);
  console.log(newArray);
  return newArray;
}

export default function TranscriptionSettings(props) {
  const {
    updateConfig,
    onChangeFunction,
    config,
    currentLanguage,
    allowedLanguages,
  } = props;

  const [languageSelect, setLanguageSelect] = useState('');

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
          <DialogContentText>Allowed languages:</DialogContentText>
          <Stack direction="row" spacing={1}>
            {updateConfig.allowed_languages.map((data) => {
              return (
                <>
                  <Chip
                    label={data}
                    onDelete={(event) => {
                      onChangeFunction(
                        'allowed_languages',
                        handleDelete(data, updateConfig.allowed_languages)
                      );
                    }}
                  />
                </>
              );
            })}
          </Stack>
          <Select
            value={languageSelect}
            label="Language"
            variant="standard"
            onChange={(e) => {
              setLanguageSelect(e.target.value);
            }}
          >
            {allowedLanguages.map((item) => {
              const loc = locale.getByTag(item);
              if (
                loc &&
                loc['iso639-1'] in BadWordsDictionaries &&
                !updateConfig.allowed_languages.includes(item)
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
              if (!updateConfig.allowed_languages.includes(languageSelect)) {
                onChangeFunction(
                  'allowed_languages',
                  updateConfig.allowed_languages.concat(languageSelect)
                );
              }
            }}
          >
            Add Language
          </Button>

          <Divider />
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
