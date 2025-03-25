import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import { MaterialThemeProvider } from './theme/MaterialTheme';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find root element');

createRoot(rootElement).render(
  <StrictMode>
    <MaterialThemeProvider>
      <App />
    </MaterialThemeProvider>
  </StrictMode>
);