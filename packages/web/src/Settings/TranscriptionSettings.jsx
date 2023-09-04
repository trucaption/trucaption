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
    configType,
    updateConfig,
    onChangeFunction,
    config,
    currentLanguage,
    allowedLanguages,
    loggedIn,
  } = props;

  const [languageSelect, setLanguageSelect] = useState('');

  return (
    <SettingsDialog {...props} title="Transcription Settings">
      <Select
        value={updateConfig[configType].api}
        label="Transcription Engine"
        fullWidth
        onChange={(event) =>
          onChangeFunction(configType, 'api', event.target.value)
        }
      >
        <MenuItem value="browser">Browser Native</MenuItem>
        <MenuItem value="azure">Azure</MenuItem>
        <MenuItem value="speechly">Speechly</MenuItem>
      </Select>
      {updateConfig[configType].api === 'azure' && (
        <>
          <TextField
            label="Azure Region"
            margin="normal"
            variant="standard"
            fullWidth
            value={updateConfig[configType].azure_region}
            required
            onChange={(event) =>
              onChangeFunction(configType, 'azure_region', event.target.value)
            }
          />
          <TextField
            label="Azure Subscription Key"
            type="password"
            margin="normal"
            variant="standard"
            fullWidth
            required
            value={updateConfig[configType].azure_subscription_key}
            onChange={(event) =>
              onChangeFunction(
                configType,
                'azure_subscription_key',
                event.target.value
              )
            }
          />
          <TextField
            label="Azure Endpoint ID"
            margin="normal"
            variant="standard"
            fullWidth
            value={updateConfig[configType].azure_endpoint_id}
            onChange={(event) =>
              onChangeFunction(
                configType,
                'azure_endpoint_id',
                event.target.value
              )
            }
          />
        </>
      )}
      {(loggedIn &&
        config[configType].api === 'azure' &&
        updateConfig[configType].api === 'azure' && (
          <>
            <DialogContentText>Allowed languages:</DialogContentText>
            <Stack direction="row" spacing={1}>
              {updateConfig[configType].allowed_languages.map((data) => {
                return (
                  <>
                    <Chip
                      label={data}
                      onDelete={(event) => {
                        onChangeFunction(
                          configType,
                          'allowed_languages',
                          handleDelete(
                            data,
                            updateConfig[configType].allowed_languages
                          )
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
                    languageSelect
                  )
                ) {
                  onChangeFunction(
                    configType,
                    'allowed_languages',
                    updateConfig[configType].allowed_languages.concat(
                      languageSelect
                    )
                  );
                }
              }}
            >
              Add Language
            </Button>

            <Divider />
            <DialogContentText>
              Default language: {updateConfig[configType].language}
            </DialogContentText>
            <Button
              variant="text"
              onClick={(event) =>
                onChangeFunction(configType, 'language', currentLanguage)
              }
            >
              Set Current Language as Default
            </Button>
          </>
        )) || (
        <>
          <DialogContentText>
            Language settings are only available when Azure is connected.
          </DialogContentText>
        </>
      )}
      {updateConfig[configType].api === 'speechly' && (
        <>
          <TextField
            label="Speechly App"
            margin="normal"
            type="password"
            fullWidth
            variant="standard"
            required
            value={updateConfig[configType].speechly_app}
            onChange={(event) =>
              onChangeFunction(configType, 'speechly_app', event.target.value)
            }
          />
        </>
      )}
    </SettingsDialog>
  );
}
