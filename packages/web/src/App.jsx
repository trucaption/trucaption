/*
    Trucaption
    Copyright (C) 2023 Derek Kaser
    @license GPL-3.0-or-later
*/

import { useEffect, useState } from "react";

import LanguageIcon from "@mui/icons-material/Language";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";

import {
  Box,
  CssBaseline,
  Divider,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Select,
} from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";

import Image from "mui-image";
import Logo from "../assets/logo.png";

import versionCheck from "@version-checker/browser";

import { useTranslation } from "react-i18next";

import { baseTheme } from "./Common.mjs";

export default function App() {
  const { t, i18n } = useTranslation();

  const searchParams = new URLSearchParams(document.location.search);

  const queryParams = {
    editorPort: searchParams.has("editorPort")
      ? searchParams.get("editorPort")
      : "",
    viewerPort: searchParams.has("viewerPort")
      ? searchParams.get("viewerPort")
      : "",
    appVersion: searchParams.has("version") ? searchParams.get("version") : "",
    viewerIP: searchParams.has("viewerIP") ? searchParams.get("viewerIP") : "",
  };

  const urls = {
    editorURL: `http://localhost:${queryParams.editorPort}/`,
    viewerURL: `http://${queryParams.viewerIP}:${queryParams.viewerPort}/`,
  };

  const [settings, setSettings] = useState({ ...queryParams, ...urls });
  const [language, setLanguage] = useState("en");

  const [updateState, setUpdateState] = useState("Unknown");

  const versionOptions = {
    repo: "trucaption",
    owner: "trucaption",
    currentVersion: queryParams.appVersion,
  };

  const drawerWidth = 300;

  useEffect(() => {
    versionCheck(versionOptions, (error, update) => {
      if (error) {
        console.log(error);
        return;
      }

      console.debug(update);

      if (update.update) {
        console.log(`An update is available: ${update.update.name}`);
        setUpdateState(t("app.updateAvailable"));
      } else {
        console.log("Version is current");
        setUpdateState(t("app.updateNotAvailable"));
      }
    });
  }, [versionOptions, t]);

  useEffect(() => {
    i18n.changeLanguage(language);

    const newUrls = {
      editorURL: `http://localhost:${queryParams.editorPort}/?language=${language}`,
      viewerURL: `http://${queryParams.viewerIP}:${queryParams.viewerPort}/?language=${language}`,
    };
    setSettings((prev) => {
      return { ...prev, ...newUrls };
    });
  }, [language, queryParams, i18n]);

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
            <ListItem disablePadding key="logo">
              <Image src={Logo} duration={0} />
            </ListItem>
          </List>
          <List>
            <ListItem disablePadding>
              <ListItemButton
                component="a"
                href={settings.editorURL}
                target="_blank"
              >
                <ListItemIcon>
                  <OpenInNewIcon />
                </ListItemIcon>
                <ListItemText>{t("app.openEditor")}</ListItemText>
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton
                component="a"
                href={settings.viewerURL}
                target="_blank"
              >
                <ListItemIcon>
                  <OpenInNewIcon />
                </ListItemIcon>
                <ListItemText>{t("app.openViewer")}</ListItemText>
              </ListItemButton>
            </ListItem>
          </List>
          <Divider />
          <List>
            <ListItem key="language">
              <ListItemIcon>
                <LanguageIcon />
              </ListItemIcon>
              <ListItemText>
                <Select
                  value={language}
                  label="Language"
                  variant="standard"
                  onChange={(e) => {
                    setLanguage(e.target.value);
                  }}
                  fullWidth
                >
                  <MenuItem value="en" key="en">
                    English
                  </MenuItem>
                  <MenuItem value="es" key="es">
                    Espanol
                  </MenuItem>
                  <MenuItem value="fr" key="fr">
                    Francais
                  </MenuItem>
                </Select>
              </ListItemText>
            </ListItem>
          </List>
          <Divider />
          <List>
            <ListItem>
              <ListItemText>
                {t("app.editorPort")}: {settings.editorPort}
              </ListItemText>
            </ListItem>
            <ListItem>
              <ListItemText>
                {t("app.viewerPort")}: {settings.viewerPort}
              </ListItemText>
            </ListItem>
          </List>
          <List style={{ marginTop: "auto" }}>
            <ListItem>
              <ListItemText>
                {t("app.version")}: {settings.appVersion}
              </ListItemText>
            </ListItem>
            <ListItem>
              <ListItemText>
                {t("app.update")}: {updateState}
              </ListItemText>
            </ListItem>
          </List>
        </Drawer>
      </Box>
    </ThemeProvider>
  );
}
