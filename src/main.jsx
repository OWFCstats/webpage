import React from 'react';
import ReactDOM from 'react-dom/client';
// Self-hosted so the type doesn't depend on a third-party CDN staying up:
// Libre Caslon Display for display, Archivo for text, Archivo Narrow for
// data. The three weights of the narrow face are the ones the tables and
// stat cells use.
import '@fontsource/libre-caslon-display';
import '@fontsource-variable/archivo';
import '@fontsource/archivo-narrow/latin-400.css';
import '@fontsource/archivo-narrow/latin-600.css';
import '@fontsource/archivo-narrow/latin-700.css';
import './styles/index.css';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
