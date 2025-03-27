import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Box, CircularProgress, Typography, Paper, Alert } from '@mui/material';

export default function AuthCallback() {
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the URL hash and query parameters
        const hash = window.location.hash;
        const query = window.location.search;
        
        // Check if we have an access token in the URL (hash or query)
        if (hash || query) {
          // Parse the hash to find auth info
          const { data, error } = await supabase.auth.getSession();
          
          if (error) {
            throw error;
          }
          
          if (data.session) {
            // Successful login
            setTimeout(() => {
              navigate('/dashboard');
            }, 1000);
          } else {
            // No session found, something went wrong
            setError('Authentication failed. Please try logging in again.');
            setTimeout(() => {
              navigate('/auth/login');
            }, 3000);
          }
        } else {
          // No hash or query parameters found
          setError('Invalid callback URL. Please try logging in again.');
          setTimeout(() => {
            navigate('/auth/login');
          }, 3000);
        }
      } catch (err) {
        console.error('Auth callback error:', err);
        setError(err instanceof Error ? err.message : 'Authentication failed');
        setTimeout(() => {
          navigate('/auth/login');
        }, 3000);
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        p: 3
      }}
    >
      <Paper elevation={3} sx={{ p: 4, maxWidth: 500, textAlign: 'center' }}>
        {error ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        ) : (
          <>
            <CircularProgress size={60} sx={{ mb: 3 }} />
            <Typography variant="h5" gutterBottom>
              Logging you in...
            </Typography>
            <Typography color="text.secondary">
              Please wait while we complete the authentication process.
            </Typography>
          </>
        )}
      </Paper>
    </Box>
  );
} 