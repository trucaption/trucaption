/*
    Trucaption
    Copyright (C) 2023 Derek Kaser
    @license GPL-3.0-or-later
*/

import { useState } from 'react';

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

  const drawerWidth = 300;

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
            <ListItem disablePadding>
              <ListItemText>Editor Port: {editorPort}</ListItemText>
            </ListItem>
            <ListItem disablePadding>
              <ListItemText>Viewer Port: {viewerPort}</ListItemText>
            </ListItem>
            <ListItem>
              <ListItemText>Version: {VERSION}</ListItemText>
            </ListItem>
          </List>
        </Drawer>
      </Box>
    </ThemeProvider>
  );
}
