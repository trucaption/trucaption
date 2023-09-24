/*
    Trucaption
    Copyright (C) 2023 Derek Kaser
    @license GPL-3.0-or-later
*/

import { useEffect, useRef, useState } from "react";

import MenuIcon from "@mui/icons-material/Menu";
import {
  Box,
  CssBaseline,
  Divider,
  Drawer,
  Fab,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Select,
  Slider,
  Typography,
} from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";

import Logo from "../assets/logo.png";
import Image from "mui-image";

import LanguageIcon from "@mui/icons-material/Language";

import axios from "axios";
import locale from "locale-codes";

import { io } from "socket.io-client";

import {
  autoScroll,
  baseTheme,
  getDisplayTheme,
  trimTranscript,
} from "./Common.mjs";

import { CONFIG_SETTINGS } from "@trucaption/common";

const SERVER_ADDRESS = `${window.location.protocol}//${window.location.host}`;

const SERVER_CLIENT = axios.create({
  baseURL: SERVER_ADDRESS,
});

export default function Viewer() {
  const [tempTranscript, setTempTranscript] = useState("Loading...");
  const [transcript, setTranscript] = useState(new Object());
  const [size, setSize] = useState(20);
  const [room, setRoom] = useState("default");
  const [open, setOpen] = useState(false);
  const [maxLines, setMaxLines] = useState(
    CONFIG_SETTINGS.display.defaults.max_lines,
  );
  const [socket, setSocket] = useState(null);
  const [translation, setTranslation] = useState(
    CONFIG_SETTINGS.translation.defaults,
  );

  const searchParams = new URLSearchParams(document.location.search);
  const noSidebar = searchParams.has("fullscreen");

  const drawerWidth = 240;

  const endRef = useRef(null);
  useEffect(() => {
    autoScroll(endRef);
  });

  function onFinal(message, maxLines) {
    const { line, text } = JSON.parse(message);

    const lineChange = {};
    lineChange[line] = text;
    setTranscript((prev) => trimTranscript(prev, lineChange, maxLines));
  }

  function onTemp(message) {
    const { text } = JSON.parse(message);
    setTempTranscript(text);
  }

  function onReset(message) {
    setTranscript(new Object());
    setTempTranscript("");
  }

  function onConnect() {
    console.log("Connected.");
    setTempTranscript("");
  }

  function toggleSidebar() {
    setOpen(!open);
  }

  async function initializeSocket() {
    setTempTranscript("");
    setTranscript({});

    console.log(`Configuring socket.io for namespace: /${room}`);

    if (socket) {
      socket.off();
      socket.close();
    }

    const newSocket = io(`/${room}`, {
      autoConnect: false,
    });

    newSocket.on("connect", onConnect);
    newSocket.on("connect_error", () => console.log("Connection error."));

    newSocket.on("final", (arg) => onFinal(arg, maxLines));
    newSocket.on("temp", (arg) => onTemp(arg));
    newSocket.on("reset", (arg) => onReset(arg));
    newSocket.on("config", loadConfig());

    setSocket(newSocket);

    while (!newSocket.connected) {
      console.log("Attempting connection.");
      newSocket.open();
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }

  async function loadConfig(firstLoad = false) {
    const response = await SERVER_CLIENT.get("/defaults");

    console.debug("Received configuration data:");
    console.debug(response.data);

    setMaxLines(response.data.max_lines);
    setTranslation(response.data.translation);

    if (firstLoad) {
      console.debug("First load -- processing searchParams");

      if (searchParams.has("language")) {
        setRoom(searchParams.get("language"));
      }

      if (searchParams.has("size")) {
        const fixedSize = searchParams.get("size");
        if (!isNaN(fixedSize)) {
          console.log("Setting fixed size");
          setSize(fixedSize);
        }
      } else {
        setSize(response.data.font_size);
      }
    }
  }

  // Load page
  useEffect(() => {
    loadConfig(true);
  }, []);

  useEffect(() => {
    console.log(`Applying maxLines: ${maxLines}`);
    console.log(`Applying room: ${room}`);

    initializeSocket();
  }, [maxLines, room]);

  return (
    <ThemeProvider theme={baseTheme}>
      <Box sx={{ display: "flow" }}>
        <CssBaseline />
        {!noSidebar && (
          <>
            <Fab
              onClick={toggleSidebar}
              style={{ position: "fixed", top: 16, right: 16 }}
              size="medium"
              sx={{ ...(open && { display: "none" }) }}
            >
              <MenuIcon />
            </Fab>
            <Drawer
              sx={{
                width: drawerWidth,
                flexShrink: 0,
                "& .MuiDrawer-paper": {
                  width: drawerWidth,
                  boxSizing: "border-box",
                },
              }}
              variant="persistent"
              anchor="right"
              open={open}
            >
              <List disablePadding>
                <ListItem disablePadding>
                  <Image src={Logo} duration={0} />
                </ListItem>
              </List>
              {translation.enabled && (
                <List>
                  <ListItem key="language">
                    <ListItemIcon>
                      <LanguageIcon />
                    </ListItemIcon>
                    <ListItemText>
                      <Select
                        value={room}
                        label="Language"
                        variant="standard"
                        onChange={(e) => {
                          setRoom(e.target.value);
                        }}
                        fullWidth
                      >
                        <MenuItem value="default" key="default">
                          Default
                        </MenuItem>
                        {translation.languages.map((item) => {
                          const loc = locale.getByTag(item);
                          return (
                            <MenuItem value={item} key={item}>
                              {loc.name}
                            </MenuItem>
                          );
                        })}
                      </Select>
                    </ListItemText>
                  </ListItem>
                </List>
              )}
              <List>
                <ListItem disablePadding>
                  <ListItemText>Font Size: ({size})</ListItemText>
                </ListItem>
                <ListItem>
                  <Slider
                    aria-label="Size"
                    value={size}
                    onChange={(e, newValue) => {
                      setSize(newValue);
                    }}
                  />
                </ListItem>
              </List>
              <Divider />
              <List>
                <ListItem key="Close" disablePadding>
                  <ListItemButton onClick={toggleSidebar}>
                    <ListItemIcon>
                      <MenuIcon />
                    </ListItemIcon>
                    <ListItemText>Close</ListItemText>
                  </ListItemButton>
                </ListItem>
              </List>
            </Drawer>
          </>
        )}
        <ThemeProvider theme={getDisplayTheme(size)}>
          {Object.keys(transcript).map((key) => {
            return (
              <Typography paragraph key={key}>
                {transcript[key]}
              </Typography>
            );
          })}
          <Typography paragraph id="working">
            {tempTranscript}
          </Typography>
        </ThemeProvider>
        <Typography ref={endRef} />
      </Box>
    </ThemeProvider>
  );
}
