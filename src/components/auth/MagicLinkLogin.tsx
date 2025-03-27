import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button, Box, TextField, Typography, Paper, Alert, Stack } from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';

export default function MagicLinkLogin() {
  const { signInWithMagicLink } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);

  async function handleMagicLinkLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      await signInWithMagicLink(email);
      setEmailSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send login link');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 500, mx: 'auto', mt: 8 }}>
      <Box
        component="form"
        onSubmit={handleMagicLinkLogin}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 3
        }}
      >
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h5" component="h1" gutterBottom>
            Login with Magic Link
          </Typography>
          <Typography color="text.secondary">
            Enter your email to receive a secure login link
          </Typography>
        </Box>

        {error && <Alert severity="error">{error}</Alert>}
        
        {emailSent ? (
          <Box sx={{ textAlign: 'center', py: 2 }}>
            <EmailIcon color="primary" sx={{ fontSize: 48, mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Check your email
            </Typography>
            <Typography color="text.secondary">
              We've sent a magic link to {email}. Click the link in the email to sign in.
            </Typography>
          </Box>
        ) : (
          <Stack spacing={3}>
            <TextField
              label="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              fullWidth
              type="email"
              autoComplete="email"
              autoFocus
              disabled={loading}
            />
            <Button 
              type="submit" 
              variant="contained" 
              size="large"
              fullWidth
              disabled={loading || !email}
            >
              {loading ? 'Sending...' : 'Send Magic Link'}
            </Button>
          </Stack>
        )}
      </Box>
    </Paper>
  );
} 