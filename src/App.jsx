/*
    Trucaption
    Copyright (C) 2023 Derek Kaser
    @license GPL-3.0-or-later
*/

import { useEffect, useRef, useState } from "react";

import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";

import axios from "axios";

import BadWordsNext from "bad-words-next";
import en from "bad-words-next/data/en.json";

import ChatBubbleIcon from "@mui/icons-material/ChatBubble";
import KeyboardCapslockIcon from "@mui/icons-material/KeyboardCapslock";
import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";
import InboxIcon from "@mui/icons-material/MoveToInbox";

import {
  Box,
  CssBaseline,
  Divider,
  Drawer,
  Input,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Slider,
  Switch,
  TextField,
  Toolbar,
  Typography,
} from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";

import Logo from "./assets/logo.png";
import Image from "mui-image";

import {
  CONSTANTS,
  autoScroll,
  baseTheme,
  getDisplayTheme,
} from "./include/Common";

const SERVER_ADDRESS = `${window.location.protocol}//${window.location.host}`;
const drawerWidth = 240;

const SERVER_CLIENT = axios.create({
  baseURL: SERVER_ADDRESS,
});

const App = () => {
  const [size, setSize] = useState(CONSTANTS.DEFAULT_FONT_SIZE);
  const [room, setRoom] = useState(CONSTANTS.DEFAULT_ROOM);

  const [useFilter, setUseFilter] = useState(true);
  const [useCaps, setUseCaps] = useState(false);

  const [loggedIn, setLoggedIn] = useState(false);

  const [wantListen, setWantListen] = useState(false);

  const [tempTranscript, setTempTranscript] = useState("");
  const [sentLength, setSentLength] = useState(0);
  const [line, setLine] = useState(1);
  const [transcript, setTranscript] = useState(new Object());
  const [sentTranscript, setSentTranscript] = useState(new Object());

  const badwords = new BadWordsNext({ data: en });

  const {
    finalTranscript,
    interimTranscript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  function sendMessage(message, messageType = "final") {
    try {
      const payload = {
        room: room,
        queue: messageType,
        data: message,
      };

      SERVER_CLIENT.post("/message", payload);
    } catch (error) {
      console.log(`Error sending message: ${error}`);
    }
  }

  function updateTranscript(lineNumber, text, send = true) {
    const lineChange = {};

    lineChange[lineNumber] = text;
    setTranscript((prev) => {
      return { ...prev, ...lineChange };
    });
    if (send) {
      sendMessage(JSON.stringify({ line: lineNumber, text: text }));
      setSentTranscript((prev) => {
        return { ...prev, ...lineChange };
      });
    }
  }

  function handleChange(e) {
    if (typeof e.target.name !== "undefined") {
      updateTranscript(e.target.name, e.target.value, false);
    }
  }

  function applyTextEffects(text) {
    let finalText = text;

    if (useFilter) finalText = badwords.filter(finalText);
    if (useCaps) finalText = finalText.toUpperCase();

    return finalText.trim();
  }

  function onKeyDown(data) {
    switch (data.key) {
      case "Escape":
        data.target.value = sentTranscript[data.target.name];
        document.activeElement.blur();
        break;
      case "Enter":
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
        applyTextEffects(finalTranscript.substring(sentLength)),
      );
      setSentLength(finalTranscript.length);
    }
  }

  function onInterimTranscript() {
    if (listening) {
      const cleanTranscript = applyTextEffects(interimTranscript);

      setTempTranscript(cleanTranscript);
      sendMessage(cleanTranscript, "temp");
    }
  }

  useEffect(onFinalTranscript, [finalTranscript]);
  useEffect(onInterimTranscript, [interimTranscript]);

  const endRef = useRef(null);
  useEffect(() => {
    autoScroll(endRef);
  });

  function startListening() {
    setWantListen(true);

    SpeechRecognition.startListening({
      continuous: true,
      language: "en-US",
    });
  }

  function stopListening() {
    setWantListen(false);
    SpeechRecognition.abortListening();
  }

  async function resetScreen() {
    setLoggedIn(false);
    if (listening) SpeechRecognition.abortListening();
    resetTranscript();

    setTranscript(new Object());
    setTempTranscript("");

    sendMessage("", "reset");

    await login();
    if (wantListen) startListening();
  }

  async function login() {
    let response;
    try {
      response = await SERVER_CLIENT.get("/config", {
        params: { room: room },
      });
    } catch (error) {
      console.log(error);
      alert("Login failed.");
      return null;
    }

    switch (response.data.api) {
      case "azure": {
        const { default: createSpeechServicesPonyfill } = await import(
          "web-speech-cognitive-services"
        );
        const { SpeechRecognition: AzureSpeechRecognition } =
          createSpeechServicesPonyfill({
            credentials: {
              region: response.data.azure_region,
              authorizationToken: response.data.azure_token,
            },
          });
        SpeechRecognition.applyPolyfill(AzureSpeechRecognition);
        setUseCaps(false);
        console.log("Initialized Azure Speech Services");
        break;
      }

      case "speechly": {
        const { createSpeechlySpeechRecognition } = await import(
          "@speechly/speech-recognition-polyfill"
        );

        const SpeechlySpeechRecognition = createSpeechlySpeechRecognition(
          response.data.speechly_app,
        );
        SpeechRecognition.applyPolyfill(SpeechlySpeechRecognition);
        setUseCaps(true);
        console.log("Initialized Speechly");
        break;
      }

      default:
        setUseCaps(true);
    }

    setLoggedIn(true);
    sendMessage("", "reset");
  }

  return (
    <ThemeProvider theme={baseTheme}>
      <Box sx={{ display: "flex" }}>
        <CssBaseline />
        <Drawer
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            "& .MuiDrawer-paper": {
              width: drawerWidth,
              boxSizing: "border-box",
            },
          }}
          variant="permanent"
          anchor="left"
        >
          <List disablePadding>
            <ListItem disablePadding>
              <Image src={Logo} duration={0} />
            </ListItem>
          </List>
          <List>
            <ListItem key="Login" disablePadding>
              <ListItemButton disabled={loggedIn} onClick={login}>
                <ListItemIcon>
                  <InboxIcon />
                </ListItemIcon>
                <ListItemText>Connect</ListItemText>
              </ListItemButton>
            </ListItem>
          </List>
          <Divider />
          <List>
            <ListItem>
              <ListItemIcon>
                {listening ? <MicIcon /> : <MicOffIcon />}
              </ListItemIcon>
              <ListItemText
                primaryTypographyProps={{ color: listening ? "red" : "green" }}
              >
                Microphone {listening ? "on" : "off"}
              </ListItemText>
            </ListItem>
          </List>
          <Divider />
          <List>
            <ListItem key="Start" disablePadding>
              <ListItemButton
                disabled={
                  !loggedIn || listening || !browserSupportsSpeechRecognition
                }
                onClick={startListening}
              >
                <ListItemIcon>
                  <MicIcon />
                </ListItemIcon>
                <ListItemText>Start Captions</ListItemText>
              </ListItemButton>
            </ListItem>
            <ListItem key="Stop" disablePadding>
              <ListItemButton
                disabled={!loggedIn || !listening}
                onClick={stopListening}
              >
                <ListItemIcon>
                  <MicOffIcon />
                </ListItemIcon>
                <ListItemText>Stop Captions</ListItemText>
              </ListItemButton>
            </ListItem>
          </List>
          <Divider />
          <List>
            <ListItem key="Start" disablePadding>
              <ListItemButton disabled={!loggedIn} onClick={resetScreen}>
                <ListItemIcon>
                  <MicIcon />
                </ListItemIcon>
                <ListItemText>Reset Captions</ListItemText>
              </ListItemButton>
            </ListItem>
          </List>
          <Divider />
          <List>
            <ListItem>
              <ListItemIcon>
                <ChatBubbleIcon />
              </ListItemIcon>
              <ListItemText>Word Filter</ListItemText>
              <Switch
                disabled={!loggedIn}
                edge="end"
                checked={useFilter}
                onChange={(e) => {
                  setUseFilter(e.target.checked);
                }}
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <KeyboardCapslockIcon />
              </ListItemIcon>
              <ListItemText>All Caps</ListItemText>
              <Switch
                disabled={!loggedIn}
                edge="end"
                checked={useCaps}
                onChange={(e) => {
                  setUseCaps(e.target.checked);
                }}
              />
            </ListItem>
          </List>
          <Divider />
          <List>
            <ListItem disablePadding>
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
          </List>
        </Drawer>
        <Box
          component="main"
          sx={{ flexGrow: 1, bgcolor: "background.default", p: 3 }}
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
      </Box>
    </ThemeProvider>
  );
};
export default App;
