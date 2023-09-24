/*
    Trucaption
    Copyright (C) 2023 Derek Kaser
    @license GPL-3.0-or-later
*/

import CmgSansWoff2 from "../assets/CMGSans-Regular.woff2";
import { createTheme } from "@mui/material/styles/index.js";

export const baseTheme = createTheme({
  palette: {
    mode: "dark",
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: `
        @font-face {
          font-family: 'CMG Sans';
          font-style: normal;
          font-display: swap;
          font-weight: 400;
          src: local('CMG Sans'), local('CMG Sans-Regular'), url(${CmgSansWoff2}) format('woff2');
        }
      `,
    },
  },
});

export function getDisplayTheme(size) {
  return createTheme({
    palette: {
      mode: "dark",
    },
    typography: {
      fontSize: size,
      fontFamily: "CMG Sans, Roboto",
    },
    components: {
      MuiInput: {
        styleOverrides: {
          root: ({ ownerState, theme }) => ({
            "&.Mui-focused": {
              backgroundColor: theme.palette.action.selected,
            },
            "&:hover:not(.Mui-focused)": {
              backgroundColor: theme.palette.action.hover,
            },
          }),
        },
      },
    },
  });
}

export function autoScroll(endRef) {
  if (endRef.current) {
    endRef.current.scrollIntoView({ behavior: "smooth" });
  }
}

export function trimTranscript(oldValues, newValues, maxLines) {
  const finalValues = { ...oldValues, ...newValues };
  const lastLine = Object.keys(finalValues).pop() - maxLines;

  if (maxLines >= 0) {
    Object.keys(finalValues).forEach((key) => {
      if (key <= lastLine) {
        console.debug(
          `Removing line: ${key}, lastLine is ${lastLine}, maxLines is ${maxLines}`,
        );
        delete finalValues[key];
      }
    });
  }

  return finalValues;
}
