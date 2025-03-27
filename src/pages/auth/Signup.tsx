import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Container, 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Alert, 
  Paper,
  Grid,
  Link as MuiLink,
  InputAdornment,
  MenuItem,
  Step,
  StepLabel,
  Stepper
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { z } from 'zod';

// Check if we're in development mode without proper Supabase credentials
const DEV_MODE = !import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY;

// Form validation schema
const userSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  businessName: z.string().min(1, 'Business name is required'),
  phone: z.string().optional(),
  address: z.string().optional(),
  currency: z.string().default('USD')
});

type UserFormData = z.infer<typeof userSchema>;

const currencies = [
  { value: 'USD', label: 'USD - $' },
  { value: 'EUR', label: 'EUR - €' },
  { value: 'GBP', label: 'GBP - £' },
  { value: 'INR', label: 'INR - ₹' },
];

const steps = ['Account Details', 'Business Profile'];

export default function Signup() {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState<UserFormData>({
    email: '',
    password: '',
    businessName: '',
    phone: '',
    address: '',
    currency: 'USD'
  });
  
  const { signUp, isDevMode } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNext = () => {
    // Validate first step (email and password)
    if (activeStep === 0) {
      try {
        z.object({
          email: userSchema.shape.email,
          password: userSchema.shape.password
        }).parse({
          email: formData.email,
          password: formData.password
        });
        setActiveStep(prev => prev + 1);
      } catch (err) {
        if (err instanceof z.ZodError) {
          setError(err.errors[0].message);
        } else {
          setError('Please check your email and password');
        }
      }
    }
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // Validate entire form
      userSchema.parse(formData);
      
      // Enhance dev mode handling
      if (isDevMode) {
        console.log('DEV MODE: Simulating successful signup - completely bypassing Supabase');
        // In dev mode, we just show success and redirect, no API calls at all
        setSuccess(true);
        
        // Store the form data in localStorage for possible later use
        localStorage.setItem('devModeUserData', JSON.stringify({
          email: formData.email,
          businessName: formData.businessName,
          currency: formData.currency,
          phone: formData.phone || null,
          address: formData.address || null,
        }));
        
        // Shorter redirect time in dev mode
        setTimeout(() => {
          navigate('/');  // Navigate to home/dashboard
        }, 1000);
        return;
      }
      
      // PRODUCTION MODE - Submit to Supabase
      try {
        await signUp(
          formData.email, 
          formData.password, 
          {
            business_name: formData.businessName,
            phone: formData.phone || null,
            address: formData.address || null,
            currency: formData.currency
          }
        );
        
        setSuccess(true);
        setTimeout(() => {
          navigate('/auth/login');
        }, 3000);
      } catch (signupError) {
        // Check for Supabase rate limiting error
        const errorMessage = signupError instanceof Error ? signupError.message : 'Failed to sign up';
        if (errorMessage.includes('security purposes') || errorMessage.includes('after 52 seconds')) {
          setError('Too many signup attempts. Please wait a minute before trying again.');
        } else if (errorMessage.includes('User already registered')) {
          setError('An account with this email already exists. Please log in instead.');
        } else {
          setError(errorMessage);
        }
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.errors[0].message);
      } else {
        setError('Please check your form inputs and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, mb: 4 }}>
        <Typography variant="h4" component="h1" align="center" gutterBottom>
          Create Your Nextshop Account
        </Typography>
        <Typography variant="body1" align="center" color="text.secondary">
          Get started with inventory and transaction management
        </Typography>
        
        {isDevMode && (
          <Alert severity="info" sx={{ mt: 2 }}>
            <strong>Development Mode:</strong> Using mock authentication. No real account will be created.
            You can enter any information and will be redirected to the dashboard automatically.
          </Alert>
        )}
      </Box>
      
      <Paper elevation={3} sx={{ p: 4 }}>
        {success ? (
          <Box sx={{ textAlign: 'center', py: 3 }}>
            <Alert severity="success" sx={{ mb: 3 }}>
              {isDevMode 
                ? 'Account created successfully in development mode!' 
                : 'Your account was created successfully!'}
            </Alert>
            <Typography variant="body1" paragraph>
              {isDevMode
                ? 'You will be redirected to the dashboard.'
                : 'Please check your email to verify your account. You will be redirected to the login page.'}
            </Typography>
          </Box>
        ) : (
          <>
            <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
            
            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
            
            <Box component="form" onSubmit={handleSubmit}>
              {activeStep === 0 ? (
                <>
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="email"
                    label="Email Address"
                    name="email"
                    autoComplete="email"
                    autoFocus
                    value={formData.email}
                    onChange={handleChange}
                    disabled={loading}
                  />
                  
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    name="password"
                    label="Password"
                    type="password"
                    id="password"
                    autoComplete="new-password"
                    value={formData.password}
                    onChange={handleChange}
                    disabled={loading}
                    helperText="Must be at least 6 characters"
                  />
                  
                  <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                      variant="contained"
                      onClick={handleNext}
                      disabled={loading}
                      sx={{ mt: 3, mb: 2 }}
                    >
                      Next
                    </Button>
                  </Box>
                </>
              ) : (
                <>
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="businessName"
                    label="Business Name"
                    name="businessName"
                    autoComplete="organization"
                    value={formData.businessName}
                    onChange={handleChange}
                    disabled={loading}
                  />
                  
                  <TextField
                    margin="normal"
                    fullWidth
                    id="phone"
                    label="Phone Number (Optional)"
                    name="phone"
                    autoComplete="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    disabled={loading}
                  />
                  
                  <TextField
                    margin="normal"
                    fullWidth
                    id="address"
                    label="Business Address (Optional)"
                    name="address"
                    autoComplete="street-address"
                    value={formData.address}
                    onChange={handleChange}
                    disabled={loading}
                    multiline
                    rows={2}
                  />
                  
                  <TextField
                    margin="normal"
                    fullWidth
                    id="currency"
                    select
                    label="Default Currency"
                    name="currency"
                    value={formData.currency}
                    onChange={handleChange}
                    disabled={loading}
                  >
                    {currencies.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </TextField>
                  
                  <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
                    <Button
                      onClick={handleBack}
                      disabled={loading}
                      sx={{ mt: 3, mb: 2 }}
                    >
                      Back
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      disabled={loading}
                      sx={{ mt: 3, mb: 2 }}
                    >
                      {loading ? 'Creating Account...' : 'Create Account'}
                    </Button>
                  </Box>
                </>
              )}
            </Box>
          </>
        )}
        
        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography variant="body2">
            Already have an account?{' '}
            <MuiLink component={Link} to="/auth/login" variant="body2">
              Sign In
            </MuiLink>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
} 