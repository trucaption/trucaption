/*
    Trucaption
    Copyright (C) 2023 Derek Kaser
    @license GPL-3.0-or-later
*/

import { useEffect, useState } from 'react';

import OpenInNewIcon from '@mui/icons-material/OpenInNew';

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
} from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';

import Logo from '../assets/logo.png';
import Image from 'mui-image';

import versionCheck from '@version-checker/browser';

import { baseTheme } from './Common.mjs';

export default function App() {
  const searchParams = new URLSearchParams(document.location.search);

  const [editorUrl, setEditorUrl] = useState(
    searchParams.has('editorUrl') ? searchParams.get('editorUrl') : ''
  );
  const [editorPort, setEditorPort] = useState(
    searchParams.has('editorPort') ? searchParams.get('editorPort') : ''
  );
  const [viewerPort, setViewerPort] = useState(
    searchParams.has('viewerPort') ? searchParams.get('viewerPort') : ''
  );
  const [appVersion, setAppVersion] = useState(
    searchParams.has('version') ? searchParams.get('version') : ''
  );
  const [updateState, setUpdateState] = useState('Unknown');

  const versionOptions = {
    repo: 'trucaption',
    owner: 'dkaser',
    currentVersion: searchParams.has('version') ? searchParams.get('version') : '',
  };

  const drawerWidth = 300;

  useEffect(() => {
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
  })

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
            <ListItem disablePadding>
              <ListItemButton component="a" href={editorUrl} target="_blank">
                <ListItemIcon>
                  <OpenInNewIcon />
                </ListItemIcon>
                <ListItemText>Open Editor</ListItemText>
              </ListItemButton>
            </ListItem>
          </List>
          <Divider />
          <List>
            <ListItem>
              <ListItemText>Editor Port: {editorPort}</ListItemText>
            </ListItem>
            <ListItem>
              <ListItemText>Viewer Port: {viewerPort}</ListItemText>
            </ListItem>
          </List>
          <List style={{ marginTop: 'auto' }} >
            <ListItem>
              <ListItemText>Version: {appVersion}</ListItemText>
            </ListItem>
            <ListItem>
              <ListItemText>Update: {updateState}</ListItemText>
            </ListItem>
          </List>
        </Drawer>
      </Box>
    </ThemeProvider>
  );
}
