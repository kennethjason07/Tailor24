import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { AuthService } from '../services/authService';

const AuthContext = createContext({
  session: null,
  user: null,
  profile: null,
  role: null,
  loading: true,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
  refreshProfile: async () => {},
});

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load initial session and listen for auth state changes
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        const initialSession = await AuthService.getSession();
        if (mounted) {
          if (initialSession?.user) {
            setSession(initialSession);
            setUser(initialSession.user);
            const userProfile = await AuthService.getProfile(initialSession.user.id, initialSession.user);
            if (mounted) {
              setProfile(userProfile);
              setRole(userProfile?.role || 'customer');
            }
          }
        }
      } catch (err) {
        console.error('Error initializing auth session:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    initializeAuth();

    // Listen to Supabase auth events (SIGNED_IN, SIGNED_OUT, TOKEN_REFRESHED, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        if (!mounted) return;

        setSession(currentSession);
        setUser(currentSession?.user || null);

        if (currentSession?.user) {
          const userProfile = await AuthService.getProfile(currentSession.user.id, currentSession.user);
          if (mounted) {
            setProfile(userProfile);
            setRole(userProfile?.role || 'customer');
            setLoading(false);
          }
        } else {
          setProfile(null);
          setRole(null);
          setLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  const signIn = async (email, password) => {
    setLoading(true);
    try {
      const result = await AuthService.signIn(email, password);
      setSession(result.session);
      setUser(result.user);
      setProfile(result.profile);
      setRole(result.role);
      return result;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email, password, metadata) => {
    setLoading(true);
    try {
      const result = await AuthService.signUp(email, password, metadata);
      return result;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      await AuthService.signOut();
      setSession(null);
      setUser(null);
      setProfile(null);
      setRole(null);
    } finally {
      setLoading(false);
    }
  };

  const refreshProfile = async () => {
    if (user?.id) {
      const refreshed = await AuthService.getProfile(user.id, user);
      setProfile(refreshed);
      setRole(refreshed?.role || 'customer');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        profile,
        role,
        loading,
        signIn,
        signUp,
        signOut,
        refreshProfile,
        isAdmin: role === 'admin',
        isCustomer: role === 'customer',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
