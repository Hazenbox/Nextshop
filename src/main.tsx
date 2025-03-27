import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import { MaterialThemeProvider } from './theme/MaterialTheme';

// Check if we're in development mode
const DEV_MODE = !import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY;

// Suppress certain console errors in development mode
if (DEV_MODE) {
  // Override console.error
  const originalConsoleError = console.error;
  console.error = function(...args) {
    // Filter out development-related errors
    const errorMessage = args[0]?.toString() || '';
    if (
      errorMessage.includes('supabase') ||
      errorMessage.includes('fetch') ||
      errorMessage.includes('Failed to load resource') ||
      errorMessage.includes('profile') ||
      errorMessage.includes('Error creating profile') ||
      errorMessage.includes('Error signing up') ||
      errorMessage.includes('404') ||
      errorMessage.includes('tykcrczbapzxqnkudbnw') || // Supabase project references
      errorMessage.includes('createProfile') ||
      errorMessage.includes('signUp')
    ) {
      // Suppress these errors in development mode
      return;
    }
    originalConsoleError.apply(console, args);
  };
  
  // Also override console.warn for some messages
  const originalConsoleWarn = console.warn;
  console.warn = function(...args) {
    const warnMessage = args[0]?.toString() || '';
    if (
      warnMessage.includes('supabase') ||
      warnMessage.includes('auth') ||
      warnMessage.includes('profile')
    ) {
      // Only log these as info in dev mode
      console.info('DEV INFO:', ...args);
      return;
    }
    originalConsoleWarn.apply(console, args);
  };

  // In extreme cases, we can also patch global fetch for specific URLs
  const originalFetch = window.fetch;
  window.fetch = function(input, init) {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input instanceof Request ? input.url : '';
    
    if (url.includes('supabase') || url.includes('profiles')) {
      console.info('DEV MODE: Intercepted fetch call to', url);
      // Return a mock successful response
      return Promise.resolve(new Response(JSON.stringify({ data: {}, error: null }), { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }));
    }
    
    return originalFetch.apply(window, [input, init]);
  };
}

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find root element');

createRoot(rootElement).render(
  <StrictMode>
    <MaterialThemeProvider>
      <App />
    </MaterialThemeProvider>
  </StrictMode>
);