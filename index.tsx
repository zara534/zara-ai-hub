import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App';
import { AIProvider } from './contexts/AIContext';
import { ThemeProvider } from './contexts/ThemeContext';

const rootElement = document.getElementById('root');

if (!rootElement) {
  // This is a fatal error, the HTML is broken.
  throw new Error("Could not find root element to mount to");
}

// In a browser environment without a build tool, `process` may not be defined.
// Your deployment platform (like Netlify) must provide this environment variable for the app to work.
const apiKey = typeof process !== 'undefined' && process.env ? process.env.API_KEY : undefined;

if (!apiKey) {
  // Stop React from rendering and show a helpful error message instead.
  rootElement.innerHTML = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; background-color: #f9fafb; color: #1f2937;">
      <div style="max-width: 600px; padding: 2rem; text-align: center; background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 0.75rem; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
        <h1 style="font-size: 1.5rem; font-weight: 700; color: #b91c1c;">Application Configuration Error</h1>
        <p style="margin-top: 1rem;">The application cannot start because a critical configuration variable is missing.</p>
        <div style="margin-top: 1.5rem; font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace; background-color: #fee2e2; padding: 0.75rem; border-radius: 0.375rem; color: #991b1b; font-size: 0.9rem; text-align: left;">
          Missing environment variable: <strong style="font-weight: 600;">API_KEY</strong>
        </div>
        <p style="margin-top: 1.5rem; text-align: left; font-size: 0.95rem;">
          To fix this, please set the <code>API_KEY</code> in your deployment environment settings. For example, if you are using Netlify, go to your site's settings and add it under "Build & deploy" > "Environment".
        </p>
      </div>
    </div>
  `;
} else {
  // API key exists, render the application.
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <HashRouter>
        <ThemeProvider>
          <AIProvider>
            <App />
          </AIProvider>
        </ThemeProvider>
      </HashRouter>
    </React.StrictMode>
  );
}
