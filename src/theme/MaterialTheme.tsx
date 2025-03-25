import React from 'react';
import { createTheme, ThemeProvider, CssBaseline } from '@mui/material';
import { blue, purple, red, amber, grey } from '@mui/material/colors';

// Material Design 3 color palette
const md3Colors = {
  primary: {
    main: '#3A9E00',
    light: '#eef6e9',
    dark: '#2a7200',
    contrastText: '#FFFFFF',
  },
  secondary: {
    main: '#4285f4',
    light: '#e8f0fe',
    dark: '#3367d6',
    contrastText: '#FFFFFF',
  },
  error: {
    main: '#d93025',
    light: '#fce8e6',
    dark: '#b31412',
    contrastText: '#FFFFFF',
  },
  warning: {
    main: '#f29900',
    light: '#fef7e0',
    dark: '#ea8600',
    contrastText: '#FFFFFF',
  },
  info: {
    main: '#1a73e8',
    light: '#e8f0fe',
    dark: '#174ea6',
    contrastText: '#FFFFFF',
  },
  success: {
    main: '#1e8e3e',
    light: '#e6f4ea',
    dark: '#0d652d',
    contrastText: '#FFFFFF',
  },
  background: {
    default: '#FFFFFF',
    paper: '#FFFFFF',
  },
  text: {
    primary: '#202124',
    secondary: '#5f6368',
    disabled: 'rgba(0, 0, 0, 0.38)',
  },
  // MD3 custom tokens
  customColors: {
    primaryContainer: '#eef6e9',
    onPrimaryContainer: '#2a7200',
    secondaryContainer: '#e8f0fe',
    onSecondaryContainer: '#3367d6',
    errorContainer: '#fce8e6',
    onErrorContainer: '#b31412',
    warningContainer: '#fef7e0',
    onWarningContainer: '#ea8600',
    surface: '#FFFFFF',
    onSurface: '#202124',
    surfaceVariant: '#f1f3f4',
    onSurfaceVariant: '#5f6368',
    surfaceContainerLow: '#f8f9fa',
    surfaceContainerLowest: '#FFFFFF',
    surfaceContainerHigh: '#e8eaed',
    outline: '#dadce0', 
    outlineVariant: '#f1f3f4'
  }
};

// Create Material Design 3 theme
const theme = createTheme({
  palette: {
    ...md3Colors,
    mode: 'light',
  },
  shape: {
    borderRadius: 8
  },
  typography: {
    fontFamily: '"Funnel Sans", "Figtree", "Funnel Display", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.25rem',
      fontWeight: 300,
      letterSpacing: '-0.025em',
      fontFamily: '"Funnel Sans", "Figtree", "Funnel Display", "Roboto", "Helvetica", "Arial", sans-serif',
    },
    h2: {
      fontSize: '1.75rem',
      fontWeight: 300,
      letterSpacing: '-0.0125em',
      fontFamily: '"Funnel Sans", "Figtree", "Funnel Display", "Roboto", "Helvetica", "Arial", sans-serif',
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 400,
      letterSpacing: '0em',
      fontFamily: '"Funnel Sans", "Figtree", "Funnel Display", "Roboto", "Helvetica", "Arial", sans-serif',
    },
    h4: {
      fontSize: '1.25rem',
      fontWeight: 400,
      letterSpacing: '0.0075em',
      fontFamily: '"Funnel Sans", "Figtree", "Funnel Display", "Roboto", "Helvetica", "Arial", sans-serif',
    },
    h5: {
      fontSize: '1.125rem',
      fontWeight: 500,
      letterSpacing: '0em',
      fontFamily: '"Funnel Sans", "Figtree", "Funnel Display", "Roboto", "Helvetica", "Arial", sans-serif',
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 500,
      letterSpacing: '0.009375em',
      fontFamily: '"Funnel Sans", "Figtree", "Funnel Display", "Roboto", "Helvetica", "Arial", sans-serif',
    },
    subtitle1: {
      fontSize: '1rem',
      fontWeight: 400,
      letterSpacing: '0.009375em',
      fontFamily: '"Funnel Sans", "Figtree", "Funnel Display", "Roboto", "Helvetica", "Arial", sans-serif',
    },
    subtitle2: {
      fontSize: '0.875rem',
      fontWeight: 500,
      letterSpacing: '0.007143em',
      fontFamily: '"Funnel Sans", "Figtree", "Funnel Display", "Roboto", "Helvetica", "Arial", sans-serif',
    },
    body1: {
      fontSize: '0.875rem',
      fontWeight: 400,
      letterSpacing: '0.014286em',
      fontFamily: '"Funnel Sans", "Figtree", "Funnel Display", "Roboto", "Helvetica", "Arial", sans-serif',
    },
    body2: {
      fontSize: '0.75rem',
      fontWeight: 400,
      letterSpacing: '0.0166667em',
      fontFamily: '"Funnel Sans", "Figtree", "Funnel Display", "Roboto", "Helvetica", "Arial", sans-serif',
    },
    button: {
      fontSize: '0.875rem',
      fontWeight: 500,
      letterSpacing: '0.01em',
      textTransform: 'none',
      fontFamily: '"Funnel Sans", "Figtree", "Funnel Display", "Roboto", "Helvetica", "Arial", sans-serif',
    },
    caption: {
      fontSize: '0.75rem',
      fontWeight: 400,
      letterSpacing: '0.0333333em',
      fontFamily: '"Funnel Sans", "Figtree", "Funnel Display", "Roboto", "Helvetica", "Arial", sans-serif',
    },
    overline: {
      fontSize: '0.625rem',
      fontWeight: 500,
      letterSpacing: '0.1666667em',
      textTransform: 'uppercase',
      fontFamily: '"Funnel Sans", "Figtree", "Funnel Display", "Roboto", "Helvetica", "Arial", sans-serif',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          textTransform: 'none',
          padding: '8px 16px',
          fontWeight: 500,
          letterSpacing: '0.01em',
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.3)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.12)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 4,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        rounded: {
          borderRadius: 8,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 4,
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          padding: '12px 16px',
          fontSize: '0.875rem',
        },
        head: {
          fontSize: '0.75rem',
          fontWeight: 500,
          color: '#5f6368',
        }
      }
    },
  },
});

interface MaterialThemeProviderProps {
  children: React.ReactNode;
}

export const MaterialThemeProvider: React.FC<MaterialThemeProviderProps> = ({ children }) => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
};

export default theme;