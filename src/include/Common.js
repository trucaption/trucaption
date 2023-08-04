/*
    Trucaption
    Copyright (C) 2023 Derek Kaser
    @license GPL-3.0-or-later
*/

const { createTheme } = require("@mui/material/styles");
const CmgSansWoff2 = require("./CMGSans-Regular.woff2");

const CONSTANTS = {
  DEFAULT_TOPIC: "cart",
  DEFAULT_FONT_SIZE: 60,
};

const baseTheme = createTheme({
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

function getDisplayTheme(size) {
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

function autoScroll(endRef) {
  if (endRef.current) {
    endRef.current.scrollIntoView({ behavior: "smooth" });
  }
}

module.exports = {
  CONSTANTS,
  baseTheme,
  getDisplayTheme,
  autoScroll,
};
