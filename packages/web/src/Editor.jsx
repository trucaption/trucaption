/*
    Trucaption
    Copyright (C) 2023 Derek Kaser
    @license GPL-3.0-or-later
*/

import { useEffect, useRef, useState } from 'react';

import SpeechRecognition, {
  useSpeechRecognition,
} from 'react-speech-recognition';

import axios from 'axios';

import BadWordsNext from 'bad-words-next';
import getUserLocale from 'get-user-locale';

import BadWordsDictionaries from './BadWordsDictionaries.mjs';

import AppMenuItem from './Menu/AppMenuItem';

import AdvancedSettings from './Settings/AdvancedSettings';
import DisplaySettings from './Settings/DisplaySettings';
import TranscriptionSettings from './Settings/TranscriptionSettings';

import locale from 'locale-codes';

import DownloadIcon from '@mui/icons-material/Download';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import InterpreterModeIcon from '@mui/icons-material/InterpreterMode';
import LanguageIcon from '@mui/icons-material/Language';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import MonitorIcon from '@mui/icons-material/Monitor';
import InboxIcon from '@mui/icons-material/MoveToInbox';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import SettingsIcon from '@mui/icons-material/Settings';

import versionCheck from '@version-checker/browser';

import fileDownload from 'js-file-download';

import {
  Box,
  Collapse,
  CssBaseline,
  Divider,
  Drawer,
  Input,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Select,
  Slider,
  Toolbar,
  Typography,
} from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';

import Logo from '../assets/logo.png';
import Image from 'mui-image';

import {
  autoScroll,
  baseTheme,
  getDisplayTheme,
  getSettings,
  trimTranscript,
} from './Common.mjs';

import { DEFAULT_CONFIG } from '@trucaption/common';

const SERVER_ADDRESS = `${window.location.protocol}//${window.location.host}`;
const drawerWidth = 240;

const SERVER_CLIENT = axios.create({
  baseURL: SERVER_ADDRESS,
});

export default function Editor() {
  const [size, setSize] = useState(20);
  const [room, setRoom] = useState('');
  const [maxLines, setMaxLines] = useState(-1);
  const [updateState, setUpdateState] = useState('Unknown');

  const [config, setConfig] = useState(null);
  const [updateConfig, setUpdateConfig] = useState(DEFAULT_CONFIG);
  const [allowedLanguages, setAllowedLanguages] = useState([
    DEFAULT_CONFIG.language,
  ]);

  const [currentLanguage, setCurrentLanguage] = useState(
    DEFAULT_CONFIG.language
  );

  const [loggedIn, setLoggedIn] = useState(false);
  const [wantListen, setWantListen] = useState(false);

  const [dialogs, setDialogs] = useState({
    display: false,
    transcription: false,
    advanced: false,
  });

  const [configMenuOpen, setConfigMenuOpen] = useState(false);

  const [tempTranscript, setTempTranscript] = useState('');
  const [sentLength, setSentLength] = useState(0);
  const [line, setLine] = useState(1);
  const [transcript, setTranscript] = useState(new Object());
  const [sentTranscript, setSentTranscript] = useState(new Object());

  let badwords = new BadWordsNext({ data: BadWordsDictionaries.en });
  const searchParams = new URLSearchParams(document.location.search);

  const {
    finalTranscript,
    interimTranscript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  const versionOptions = {
    repo: 'trucaption',
    owner: 'dkaser',
    currentVersion: VERSION,
  };

  function sendMessage(message, messageType = 'final') {
    try {
      const payload = {
        room: room,
        queue: messageType,
        data: message,
      };

      SERVER_CLIENT.post('/message', payload);
    } catch (error) {
      console.log(`Error sending message: ${error}`);
    }
  }

  function updateTranscript(lineNumber, text, send = true) {
    const lineChange = {};

    lineChange[lineNumber] = text;
    setTranscript((prev) => trimTranscript(prev, lineChange, maxLines));
    if (send) {
      sendMessage(JSON.stringify({ line: lineNumber, text: text }));
      setSentTranscript((prev) => {
        return { ...prev, ...lineChange };
      });
    }
  }

  function handleChange(e) {
    if (typeof e.target.name !== 'undefined') {
      updateTranscript(e.target.name, e.target.value, false);
    }
  }

  function applyTextEffects(text) {
    let finalText = text;

    console.debug(finalText);
    if (config.word_filter) finalText = badwords.filter(finalText);
    console.debug(finalText);
    if (config.all_caps) finalText = finalText.toUpperCase();

    return finalText.trim();
  }

  function onKeyDown(data) {
    switch (data.key) {
      case 'Escape':
        data.target.value = sentTranscript[data.target.name];
        document.activeElement.blur();
        break;
      case 'Enter':
        document.activeElement.blur();
        break;
    }
  }

  function onBlur(data) {
    updateTranscript(data.target.name, data.target.value, true);
  }

  function onFinalTranscript() {
    if (finalTranscript) {
      setLine(line + 1);

      updateTranscript(
        line,
        applyTextEffects(finalTranscript.substring(sentLength))
      );
      setSentLength(finalTranscript.length);
    }
  }

  function onInterimTranscript() {
    if (listening) {
      const cleanTranscript = applyTextEffects(interimTranscript);

      setTempTranscript(cleanTranscript);
      sendMessage(cleanTranscript, 'temp');
    }
  }

  function downloadTranscript() {
    fileDownload(Object.values(sentTranscript).join('\n'), 'transcript.txt');
  }

  useEffect(onFinalTranscript, [finalTranscript]);
  useEffect(onInterimTranscript, [interimTranscript]);

  const endRef = useRef(null);
  useEffect(() => {
    autoScroll(endRef);
  });

  function changeConfigValue(key, value) {
    const newVal = {};
    newVal[key] = value;
    setUpdateConfig((prev) => {
      return { ...prev, ...newVal };
    });
  }

  function startListening() {
    setWantListen(true);

    const listeningConfig = {
      continuous: true,
    };

    console.debug(`Listening via speech API: ${config.api}`);

    let targetDict = 'en';

    if (config.api === 'azure' || config.api === 'speechly') {
      listeningConfig.language = currentLanguage;
      targetDict = locale.getByTag(currentLanguage)['iso639-1'];
      console.log(
        `Starting captions with configured language: ${currentLanguage}`
      );
    } else {
      const userLocale = getUserLocale();
      targetDict = locale.getByTag(userLocale)['iso639-1'];
      console.log(`Starting captions with browser language: ${userLocale}`);
    }

    console.log(`Loading bad-words dictionary: ${targetDict}`);
    const dict = BadWordsDictionaries[targetDict];
    console.debug(dict);
    badwords = new BadWordsNext({ data: dict });

    SpeechRecognition.startListening(listeningConfig);
  }

  function stopListening() {
    setWantListen(false);
    SpeechRecognition.abortListening();

    if (!config.clear_temp_on_stop) {
      setLine(line + 1);

      updateTranscript(line, applyTextEffects(interimTranscript));
    }

    setTempTranscript('');
  }

  function languageChangeAllowed() {
    return !wantListen && loggedIn && config && config.api !== 'browser';
  }

  async function resetScreen() {
    setLoggedIn(false);
    if (listening) SpeechRecognition.abortListening();
    resetTranscript();

    setTranscript(new Object());
    setTempTranscript('');
    setSentTranscript(new Object());
    setSentLength(0);

    sendMessage('', 'reset');

    await login();
    if (wantListen) startListening();
  }

  async function login() {
    let response;
    try {
      response = await SERVER_CLIENT.get('/connect', {
        params: { room: room },
      });
    } catch (error) {
      console.log(error);
      alert('Login failed.');
      return null;
    }

    console.debug(response);
    setConfig(response.data);

    switch (response.data.api) {
      case 'azure': {
        const { default: createSpeechServicesPonyfill } = await import(
          'web-speech-cognitive-services'
        );
        const { SpeechRecognition: AzureSpeechRecognition } =
          createSpeechServicesPonyfill({
            credentials: {
              region: response.data.azure_region,
              authorizationToken: response.data.azure_token,
            },
            speechRecognitionEndpointId: response.data.azure_endpoint_id
              ? response.data.azure_endpoint_id
              : undefined,
          });
        SpeechRecognition.applyPolyfill(AzureSpeechRecognition);
        setAllowedLanguages(filterLanguages(response.data.azure_languages));
        setCurrentLanguage(response.data.language);
        console.debug(locale.getByTag(response.data.language));
        console.log('Initialized Azure Speech Services');
        break;
      }

      case 'speechly': {
        const { createSpeechlySpeechRecognition } = await import(
          '@speechly/speech-recognition-polyfill'
        );

        const SpeechlySpeechRecognition = createSpeechlySpeechRecognition(
          response.data.speechly_app
        );
        setAllowedLanguages([DEFAULT_CONFIG.language]);
        setCurrentLanguage(DEFAULT_CONFIG.language);
        SpeechRecognition.applyPolyfill(SpeechlySpeechRecognition);
        console.log('Initialized Speechly');
        break;
      }

      default:
        SpeechRecognition.removePolyfill();
        setAllowedLanguages(['']);
        setCurrentLanguage('');
    }

    setLoggedIn(true);
    sendMessage('', 'reset');
  }

  function filterLanguages(languages) {
    return languages.map((item) => {
      const loc = locale.getByTag(item);

      if (!loc) return;
      if (!(loc['iso639-1'] in BadWordsDictionaries)) return;

      return item;
    });
  }

  function openClient() {
    window.open(`http://${config.server_ip}:${config.client_port}/`);
  }

  async function loadPage() {
    await getSettings(SERVER_CLIENT, searchParams, setSize, setMaxLines);
    versionCheck(versionOptions, function (error, update) {
      if (error) {
        console.log(error);
        return;
      }

      console.debug(update);

      if (update.update) {
        console.log(`An update is available: ${update.update.name}`);
        setUpdateState('Available');
      } else {
        console.log('Version is current');
        setUpdateState('Not Available');
      }
    });

    console.debug(`Detected locale: ${getUserLocale()}`);
  }

  async function openConfig(panel) {
    let response;
    try {
      response = await SERVER_CLIENT.get('/config', {
        params: { room: room },
      });
    } catch (error) {
      console.log(error);
      alert('Could not retrieve config.');
      return null;
    }

    console.debug(response);
    setUpdateConfig(response.data);

    configPanel(panel, true);
  }

  function configPanel(panel, open) {
    const openDialog = {};
    openDialog[panel] = open;
    setDialogs((prev) => {
      return { ...prev, ...openDialog };
    });
  }

  async function saveConfig(panel, logoff = false) {
    try {
      await SERVER_CLIENT.post('/config', updateConfig);
    } catch (error) {
      console.log(error);
      alert('Could not save config.');
      return null;
    }

    setMaxLines(updateConfig.max_lines);
    configPanel(panel, false);

    if (logoff) {
      setLoggedIn(false);
    } else {
      setConfig(updateConfig);
    }
  }

  // Load page
  useEffect(() => {
    loadPage();
  }, []);

  return (
    <ThemeProvider theme={baseTheme}>
      <Box sx={{ display: 'flex' }}>
        <CssBaseline />
        <Drawer
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
            },
          }}
          variant="permanent"
          anchor="left"
        >
          <List disablePadding>
            <ListItem disablePadding key="logo">
              <Image src={Logo} duration={0} />
            </ListItem>
          </List>
          <List>
            <AppMenuItem
              disabled={loggedIn}
              onClick={login}
              icon={<InboxIcon />}
              text="Connect"
            />
          </List>
          <Divider />
          <List>
            <ListItem>
              <ListItemIcon>
                {listening ? <MicIcon /> : <MicOffIcon />}
              </ListItemIcon>
              <ListItemText
                primaryTypographyProps={{ color: listening ? 'red' : 'green' }}
              >
                Microphone {listening ? 'on' : 'off'}
              </ListItemText>
            </ListItem>
          </List>
          <Divider />
          <List>
            <AppMenuItem
              disabled={
                !loggedIn || listening || !browserSupportsSpeechRecognition
              }
              onClick={startListening}
              icon={<MicIcon />}
              text="Start Captions"
            />
            <AppMenuItem
              disabled={!loggedIn || !listening}
              onClick={stopListening}
              icon={<MicOffIcon />}
              text="Stop Captions"
            />
          </List>
          <Divider />
          <List>
            <AppMenuItem
              disabled={!loggedIn}
              onClick={resetScreen}
              icon={<MicIcon />}
              text="Reset Captions"
            />
          </List>
          <Divider />
          <List>
            <AppMenuItem
              disabled={!loggedIn || !browserSupportsSpeechRecognition}
              onClick={openClient}
              icon={<OpenInNewIcon />}
              text="Open Viewer"
            />
            <AppMenuItem
              disabled={!loggedIn || !browserSupportsSpeechRecognition}
              onClick={downloadTranscript}
              icon={<DownloadIcon />}
              text="Download"
            />
          </List>
          <Divider />
          <List>
            <AppMenuItem
              disabled={false}
              onClick={() => setConfigMenuOpen(!configMenuOpen)}
              icon={configMenuOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              text="Settings"
            />
          </List>
          <Collapse in={configMenuOpen}>
            <List>
            {loggedIn && config && config.api === 'azure' && (
              <ListItem key="language">
                <ListItemIcon>
                  <LanguageIcon
                    color={languageChangeAllowed() ? 'inherit' : 'disabled'}
                  />
                </ListItemIcon>
                <ListItemText>
                  <Select
                    value={currentLanguage}
                    disabled={!languageChangeAllowed()}
                    label="Language"
                    variant="standard"
                    onChange={(e) => {
                      setCurrentLanguage(e.target.value);
                    }}
                    fullWidth
                  >
                    {allowedLanguages.map((item) => {
                      const loc = locale.getByTag(item);
                      const allowed =
                        config.allowed_languages.length === 0
                          ? true
                          : config.allowed_languages.includes(item);
                      if (
                        loc &&
                        loc['iso639-1'] in BadWordsDictionaries &&
                        allowed
                      )
                        return (
                          <MenuItem value={item} key={item}>
                            {loc.name} ({loc.location})
                          </MenuItem>
                        );
                    })}
                  </Select>
                </ListItemText>
              </ListItem>
            )}
              <ListItem>
                <ListItemText>Font Size: ({size})</ListItemText>
              </ListItem>
              <ListItem>
                <Slider
                  disabled={!loggedIn}
                  aria-label="Size"
                  value={size}
                  onChange={(e, newValue) => {
                    setSize(newValue);
                  }}
                />
              </ListItem>
              <AppMenuItem
                disabled={wantListen}
                onClick={() => openConfig('transcription')}
                icon={<InterpreterModeIcon />}
                text="Transcription Engine"
              />
              <AppMenuItem
                disabled={false}
                onClick={() => openConfig('display')}
                icon={<MonitorIcon />}
                text="Display Settings"
              />
              <AppMenuItem
                disabled={wantListen}
                onClick={() => openConfig('advanced')}
                icon={<SettingsIcon />}
                text="Advanced Settings"
              />
            </List>
          </Collapse>
          {!configMenuOpen && (
            <List style={{ marginTop: 'auto' }}>
              <ListItem>
                <ListItemText>
                  Version: {VERSION} <br />
                  Update: {updateState}
                </ListItemText>
              </ListItem>
            </List>
          )}
        </Drawer>
        <Box
          component="main"
          sx={{ flexGrow: 1, bgcolor: 'background.default', p: 3 }}
        >
          <Toolbar />
          <ThemeProvider theme={getDisplayTheme(size)}>
            <CssBaseline />
            <Box>
              {Object.keys(transcript).map((key) => {
                return (
                  <Input
                    name={key}
                    key={key}
                    value={transcript[key]}
                    multiline
                    fullWidth
                    onChange={(e) => handleChange(e)}
                    onKeyDown={onKeyDown}
                    onBlur={onBlur}
                    disableUnderline
                  />
                );
              })}

              <Typography color="text.secondary" paragraph id="working">
                {tempTranscript}
              </Typography>
            </Box>
          </ThemeProvider>
          <Typography ref={endRef} />
        </Box>

        <TranscriptionSettings
          open={dialogs.transcription}
          config={config}
          updateConfig={updateConfig}
          onChangeFunction={changeConfigValue}
          onCancel={() => configPanel('transcription', false)}
          onSave={() => saveConfig('transcription', true)}
          currentLanguage={currentLanguage}
          allowedLanguages={allowedLanguages}
        />

        <DisplaySettings
          open={dialogs.display}
          updateConfig={updateConfig}
          onChangeFunction={changeConfigValue}
          onCancel={() => configPanel('display', false)}
          onSave={() => saveConfig('display', true)}
        />

        <AdvancedSettings
          open={dialogs.advanced}
          updateConfig={updateConfig}
          onChangeFunction={changeConfigValue}
          onCancel={() => configPanel('advanced', false)}
          onSave={() => saveConfig('advanced', true)}
        />
      </Box>
    </ThemeProvider>
  );
}
