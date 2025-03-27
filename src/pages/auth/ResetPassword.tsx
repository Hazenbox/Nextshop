import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Alert, 
  Paper, 
  Link as MuiLink,
  CircularProgress
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import LockIcon from '@mui/icons-material/Lock';
import { z } from 'zod';

// Form validation schema
const passwordSchema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword']
});

type PasswordFormData = z.infer<typeof passwordSchema>;

export default function ResetPassword() {
  const [formData, setFormData] = useState<PasswordFormData>({
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [hashPresent, setHashPresent] = useState(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    // Check if we have a hash in the URL (indicating a valid reset link)
    const hash = window.location.hash;
    const query = window.location.search;
    
    if (hash || query) {
      setHashPresent(true);
    } else {
      setError('Invalid password reset link. Please request a new one.');
      setTimeout(() => {
        navigate('/auth/forgot-password');
      }, 3000);
    }
  }, [navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate form
      passwordSchema.parse(formData);
      
      // Update password
      const { error } = await supabase.auth.updateUser({
        password: formData.password
      });

      if (error) throw error;
      
      setSuccess(true);
      setTimeout(() => {
        navigate('/auth/login');
      }, 3000);
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.errors[0].message);
      } else {
        setError(err instanceof Error ? err.message : 'Failed to reset password');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!hashPresent && !error) {
    return (
      <Container maxWidth="sm">
        <Box sx={{ 
          mt: 8, 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <CircularProgress />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Verifying reset link...
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, mb: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <LockIcon color="primary" sx={{ fontSize: 48, mb: 2 }} />
        <Typography variant="h4" component="h1" align="center" gutterBottom>
          Reset Your Password
        </Typography>
        <Typography variant="body1" align="center" color="text.secondary">
          Enter a new password for your account
        </Typography>
      </Box>

      <Paper elevation={3} sx={{ p: 4 }}>
        {success ? (
          <Box sx={{ textAlign: 'center', py: 2 }}>
            <Alert severity="success" sx={{ mb: 3 }}>
              Password updated successfully!
            </Alert>
            <Typography paragraph>
              Your password has been reset. You'll be redirected to the login page to sign in with your new password.
            </Typography>
            <MuiLink component={Link} to="/auth/login" variant="body2">
              Go to login
            </MuiLink>
          </Box>
        ) : (
          <Box component="form" onSubmit={handleSubmit}>
            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="New Password"
              type="password"
              id="password"
              autoComplete="new-password"
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
              helperText="Must be at least 6 characters"
            />

            <TextField
              margin="normal"
              required
              fullWidth
              name="confirmPassword"
              label="Confirm Password"
              type="password"
              id="confirmPassword"
              autoComplete="new-password"
              value={formData.confirmPassword}
              onChange={handleChange}
              disabled={loading}
              error={formData.password !== formData.confirmPassword && formData.confirmPassword !== ''}
              helperText={
                formData.password !== formData.confirmPassword && formData.confirmPassword !== '' 
                  ? "Passwords don't match" 
                  : ""
              }
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading || !formData.password || !formData.confirmPassword}
              sx={{ mt: 3, mb: 2 }}
            >
              {loading ? 'Updating...' : 'Update Password'}
            </Button>
          </Box>
        )}
      </Paper>
    </Container>
  );
} 