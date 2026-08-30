import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import ErrorBoundary from "./components/ErrorBoundary";
import './index.css';

// Global resilience handlers for transient IndexedDB / iframe background states
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    const reason = event?.reason;
    const msg = (reason instanceof Error ? reason.message : String(reason || '')).toLowerCase();
    if (
      msg.includes('database is closing') ||
      msg.includes('closing/hidden') ||
      msg.includes('indexeddb') ||
      msg.includes('connection is closing') ||
      msg.includes('the client is offline') ||
      msg.includes('failed to execute \'transaction\' on \'idbdatabase\'')
    ) {
      event.preventDefault();
      console.warn('[Global Resilience] Suppressed transient database state:', msg);
    }
  });

  window.addEventListener('error', (event) => {
    const msg = (event?.message || '').toLowerCase();
    if (
      msg.includes('database is closing') ||
      msg.includes('closing/hidden') ||
      msg.includes('indexeddb') ||
      msg.includes('connection is closing')
    ) {
      event.preventDefault();
      console.warn('[Global Resilience] Suppressed window database error:', msg);
    }
  });
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </BrowserRouter>
  </React.StrictMode>
);