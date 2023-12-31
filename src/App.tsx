import React, { useState } from 'react';
import './App.css';
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes";
import { createTheme, CssBaseline, FormControlLabel, Switch, ThemeProvider } from "@mui/material";
import { useAppSelector } from "./store/hooks";
import { selectThemeMode } from "./appSlice";
import logger from './utils/logger';

function App() {
  logger.info('App', 'REACT_APP_VERSION', process.env.REACT_APP_VERSION);

  const themeMode = useAppSelector(selectThemeMode);

  const theme = createTheme({
    palette: {
      mode: themeMode
    },
  });
  return (
    <ThemeProvider theme={theme}>
        <div className="App">
          <CssBaseline/>
          <AppRoutes/>
        </div>
    </ThemeProvider>
  );
}

export default App;
