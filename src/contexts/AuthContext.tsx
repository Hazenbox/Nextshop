import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase, profileService, MOCK_PROFILE } from '../lib/supabase';
import type { Database } from '../types/supabase';

// Check if we're in development mode without proper Supabase credentials
const DEV_MODE = !import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY;

// Define Profile type directly to avoid import error
type Profile = Database['public']['Tables']['profiles']['Row'];

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  isDevMode: boolean;
  signIn: (email: string, password: string) => Promise<any>;
  signInWithMagicLink: (email: string) => Promise<any>;
  signUp: (email: string, password: string, profileData: Omit<Profile, 'id' | 'email' | 'created_at' | 'updated_at'>) => Promise<any>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Omit<Profile, 'id' | 'email'>>) => Promise<Profile>;
}

// Create a named context for better debugging
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Separate the hook from the provider component for better Fast Refresh compatibility
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// AuthProvider component definition
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch user profile when user changes
  useEffect(() => {
    async function loadProfile() {
      if (!user) {
        setProfile(null);
        return;
      }

      // In dev mode, always use the mock profile without making any API call
      if (DEV_MODE) {
        console.log('DEV MODE: Using mock profile');
        
        // Check if we have user data in localStorage (from signup)
        const storedUserData = localStorage.getItem('devModeUserData');
        if (storedUserData) {
          try {
            const userData = JSON.parse(storedUserData);
            const customProfile = {
              ...MOCK_PROFILE,
              business_name: userData.businessName || MOCK_PROFILE.business_name,
              email: userData.email || MOCK_PROFILE.email,
              currency: userData.currency || MOCK_PROFILE.currency,
              phone: userData.phone || MOCK_PROFILE.phone,
              address: userData.address || MOCK_PROFILE.address,
            };
            setProfile(customProfile);
            return;
          } catch (e) {
            console.info('Failed to parse stored user data, using default mock profile');
          }
        }
        
        setProfile(MOCK_PROFILE);
        return;
      }

      try {
        const userProfile = await profileService.getProfile(user.id);
        setProfile(userProfile);
      } catch (error) {
        console.error('Error loading user profile:', error);
      }
    }

    loadProfile();
  }, [user]);

  useEffect(() => {
    // In dev mode, simulate auth after a short delay
    if (DEV_MODE) {
      console.log('DEV MODE: Setting up mock user and session');
      const timer = setTimeout(() => {
        setUser({
          id: MOCK_PROFILE.id,
          email: MOCK_PROFILE.email || 'demo@example.com',
          app_metadata: { provider: 'email' },
          user_metadata: {},
          aud: 'authenticated',
          created_at: MOCK_PROFILE.created_at,
        } as User);
        setProfile(MOCK_PROFILE);
        setLoading(false);
      }, 500);
      
      return () => clearTimeout(timer);
    }
    
    // Standard auth check for production
    console.log('Production mode: Checking for real Supabase authentication');
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for changes on auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error signing in:', error);
      // In dev mode, log the error but don't throw it
      if (DEV_MODE) {
        console.warn('Dev mode: Using mock authentication');
        return { user: user };
      }
      throw error;
    }
  };

  const signInWithMagicLink = async (email: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          shouldCreateUser: true,
        }
      });
      
      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('Error sending magic link:', error);
      // In dev mode, log the error but don't throw it
      if (DEV_MODE) {
        console.warn('Dev mode: Using mock magic link');
        return { user: null };
      }
      throw error;
    }
  };

  const signUp = async (
    email: string, 
    password: string, 
    profileData: Omit<Profile, 'id' | 'email' | 'created_at' | 'updated_at'>
  ) => {
    try {
      // In dev mode, immediately return success without any API calls
      if (DEV_MODE) {
        console.log('DEV MODE: Simulating successful signup without API calls');
        
        // Store user data for profile loading
        localStorage.setItem('devModeUserData', JSON.stringify({
          email,
          businessName: profileData.business_name,
          currency: profileData.currency,
          phone: profileData.phone,
          address: profileData.address,
        }));
        
        // Set user state directly
        setUser({
          id: MOCK_PROFILE.id,
          email: email || 'demo@example.com',
          app_metadata: { provider: 'email' },
          user_metadata: {},
          aud: 'authenticated',
          created_at: new Date().toISOString(),
        } as User);
        
        // Also set profile directly
        const mockProfile = {
          ...MOCK_PROFILE,
          email,
          business_name: profileData.business_name,
          currency: profileData.currency,
          phone: profileData.phone,
          address: profileData.address,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        setProfile(mockProfile);
        
        return { user: MOCK_PROFILE, session: null };
      }
      
      // First sign up the user
      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        }
      });
      
      if (error) throw error;
      
      // Then create their profile
      if (data.user) {
        try {
          await profileService.createProfile({
            id: data.user.id,
            email: data.user.email || null,
            ...profileData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        } catch (profileError) {
          console.error('Error creating profile:', profileError);
          // In dev mode, continue even if profile creation fails
          if (!DEV_MODE) throw profileError;
        }
      }
      
      return data;
    } catch (error) {
      console.error('Error signing up:', error);
      throw error;
    }
  };

  const updateProfile = async (updates: Partial<Omit<Profile, 'id' | 'email'>>) => {
    if (!user) throw new Error('User must be logged in to update profile');
    
    try {
      const updatedProfile = await profileService.updateProfile(user.id, updates);
      setProfile(updatedProfile);
      return updatedProfile;
    } catch (error) {
      console.error('Error updating profile:', error);
      // In dev mode, update the mock profile
      if (DEV_MODE) {
        const mockUpdatedProfile = {
          ...MOCK_PROFILE,
          ...updates,
          updated_at: new Date().toISOString()
        };
        setProfile(mockUpdatedProfile);
        return mockUpdatedProfile;
      }
      throw error;
    }
  };

  const value = {
    user,
    profile,
    loading,
    isDevMode: DEV_MODE,
    signIn,
    signInWithMagicLink,
    signUp,
    signOut: async () => {
      try {
        if (DEV_MODE) {
          console.warn('Dev mode: Mock sign out');
          setUser(null);
          setProfile(null);
          return;
        }
        
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
      } catch (error) {
        console.error('Error signing out:', error);
        throw error;
      }
    },
    updateProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
      {DEV_MODE && user && (
        <div style={{
          position: 'fixed',
          bottom: '10px',
          right: '10px',
          background: '#ffe082',
          color: '#ff6d00',
          padding: '5px 10px',
          borderRadius: '4px',
          fontSize: '12px',
          zIndex: 9999,
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
        }}>
          Development Mode: Using Mock Auth
        </div>
      )}
    </AuthContext.Provider>
  );
}