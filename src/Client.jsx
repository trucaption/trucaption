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
  Slider,
  Typography,
} from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";

import Logo from "./assets/logo.png";
import Image from "mui-image";

import axios from "axios";

import {
  autoScroll,
  baseTheme,
  getDisplayTheme,
  getSettings,
  trimTranscript,
} from "./include/Common";

const SERVER_ADDRESS = `${window.location.protocol}//${window.location.host}`;

const SERVER_CLIENT = axios.create({
  baseURL: SERVER_ADDRESS,
});

const Client = () => {
  const [tempTranscript, setTempTranscript] = useState("Loading...");
  const [transcript, setTranscript] = useState(new Object());
  const [size, setSize] = useState(20);
  const [room, setRoom] = useState("");
  const [open, setOpen] = useState(false);
  const [maxLines, setMaxLines] = useState(-1);

  const searchParams = new URLSearchParams(document.location.search);
  const noSidebar = searchParams.has("fullscreen");

  const drawerWidth = 240;

  if (searchParams.has("room")) setRoom(searchParams.get("room"));

  const endRef = useRef(null);
  useEffect(() => {
    autoScroll(endRef);
  });

  function onFinal(message) {
    const { line, text } = JSON.parse(message);

    const lineChange = {};
    lineChange[line] = text;
    setTranscript((prev) => trimTranscript(prev, lineChange, maxLines));
  }

  function onReset(message) {
    setTranscript(new Object());
    setTempTranscript("");
  }

  function onLines(lines) {
    setMaxLines(lines);
  }

  function onConnect() {
    console.log("Connected.");
    setTempTranscript("");
  }

  function toggleSidebar() {
    setOpen(!open);
  }

  async function initializeSocket() {
    const { io } = await import("socket.io-client");

    const socket = io(`/${room}`, {
      autoConnect: false,
    });

    socket.on("connect", onConnect);
    socket.on("connect_error", () => console.log("Connection error."));

    socket.on("final", (arg) => onFinal(arg));
    socket.on("temp", (arg) => setTempTranscript(arg));
    socket.on("reset", (arg) => onReset(arg));
    socket.on("config", onLines());

    while (!socket.connected) {
      console.log("Attempting connection.");
      socket.open();
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }

  // Load page
  useEffect(() => {
    getSettings(SERVER_CLIENT, searchParams, setSize, setMaxLines);
    initializeSocket();
  }, []);

  function Sidebar() {
    if (noSidebar) return null;

    return (
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
            <ListItem key="Start" disablePadding>
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
    );
  }

  return (
    <ThemeProvider theme={baseTheme}>
      <Box sx={{ display: "flow" }}>
        <CssBaseline />
        <Sidebar />
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
};
export default Client;
