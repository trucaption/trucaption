/*
    Trucaption
    Copyright (C) 2023 Derek Kaser
    @license GPL-3.0-or-later
*/

const { createTheme } = require("@mui/material/styles");
const CmgSansWoff2 = require("./CMGSans-Regular.woff2");

async function getSettings(SERVER_CLIENT, searchParams, setSize, setMaxLines) {
  const response = await SERVER_CLIENT.get("/defaults");

  console.debug("Received configuration data:");
  console.debug(response.data);

  setMaxLines(response.data.max_lines);

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

function trimTranscript(oldValues, newValues, maxLines) {
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

module.exports = {
  baseTheme,
  getDisplayTheme,
  autoScroll,
  trimTranscript,
  getSettings,
};
