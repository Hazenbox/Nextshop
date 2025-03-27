import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Alert,
  CircularProgress,
  MenuItem,
  Divider,
  Avatar
} from '@mui/material';
import { z } from 'zod';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import BusinessIcon from '@mui/icons-material/Business';

// Form validation schema
const profileSchema = z.object({
  businessName: z.string().min(1, 'Business name is required'),
  phone: z.string().optional(),
  address: z.string().optional(),
  currency: z.string().min(1, 'Currency is required')
});

type ProfileFormData = {
  businessName: string;
  phone: string;
  address: string;
  currency: string;
};

const currencies = [
  { value: 'USD', label: 'USD - $' },
  { value: 'EUR', label: 'EUR - €' },
  { value: 'GBP', label: 'GBP - £' },
  { value: 'INR', label: 'INR - ₹' },
];

export default function UserProfile() {
  const { user, profile, updateProfile } = useAuth();
  const [formData, setFormData] = useState<ProfileFormData>({
    businessName: '',
    phone: '',
    address: '',
    currency: 'USD'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Initialize form with profile data when it's available
  useEffect(() => {
    if (profile) {
      setFormData({
        businessName: profile.business_name || '',
        phone: profile.phone || '',
        address: profile.address || '',
        currency: profile.currency || 'USD'
      });
    }
  }, [profile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Reset status messages when user starts typing
    setError(null);
    setSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Validate form
      profileSchema.parse(formData);

      // Update profile
      await updateProfile({
        business_name: formData.businessName,
        phone: formData.phone || null,
        address: formData.address || null,
        currency: formData.currency
      });

      setSuccess(true);
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.errors[0].message);
      } else {
        setError(err instanceof Error ? err.message : 'Failed to update profile');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper elevation={2} sx={{ p: 4, maxWidth: 800, mx: 'auto' }}>
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center' }}>
        <Avatar sx={{ width: 60, height: 60, mr: 2, bgcolor: 'primary.main' }}>
          <AccountCircleIcon fontSize="large" />
        </Avatar>
        <Box>
          <Typography variant="h5" component="h1" gutterBottom>
            Profile Settings
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {user.email}
          </Typography>
        </Box>
      </Box>

      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Profile updated successfully!
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Divider sx={{ my: 3 }} />

      <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
        <BusinessIcon sx={{ mr: 1 }} /> Business Information
      </Typography>

      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              label="Business Name"
              name="businessName"
              value={formData.businessName}
              onChange={handleChange}
              fullWidth
              required
              disabled={loading}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              label="Phone Number"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              fullWidth
              disabled={loading}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              label="Currency"
              name="currency"
              value={formData.currency}
              onChange={handleChange}
              select
              fullWidth
              required
              disabled={loading}
            >
              {currencies.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Business Address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              fullWidth
              multiline
              rows={3}
              disabled={loading}
            />
          </Grid>

          <Grid item xs={12}>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              sx={{ mt: 2 }}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </Grid>
        </Grid>
      </Box>

      <Divider sx={{ my: 4 }} />

      <Box>
        <Typography variant="h6" gutterBottom>
          Account Security
        </Typography>
        <Button
          variant="outlined"
          color="primary"
          component="a"
          href="/auth/reset-password"
          sx={{ mt: 1 }}
        >
          Change Password
        </Button>
      </Box>
    </Paper>
  );
} 