import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { base44 } from '@/api/base44Client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);

  const refresh = useCallback(async (session) => {
    if (!session) {
      setUser(null);
      setIsAuthenticated(false);
    } else {
      setIsAuthenticated(true);
      try {
        setUser(await base44.auth.me());
      } catch {
        setUser(null);
      }
    }
    setAuthChecked(true);
    setIsLoadingAuth(false);
  }, []);

  useEffect(() => {
    // Subscribe first, then read the stored session.
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'TOKEN_REFRESHED') return;
      // Defer the profile load out of the auth callback.
      setTimeout(() => { refresh(session); }, 0);
    });
    supabase.auth.getSession().then(({ data }) => refresh(data.session));
    return () => sub.subscription.unsubscribe();
  }, [refresh]);

  // After Google sign-in, return to the page the visitor came from.
  useEffect(() => {
    if (!isAuthenticated) return;
    try {
      const back = sessionStorage.getItem('auth_return_to');
      if (back) {
        sessionStorage.removeItem('auth_return_to');
        if (back.startsWith('/') && !back.startsWith('//') && back !== window.location.pathname) {
          window.location.replace(back);
        }
      }
    } catch { /* ignore */ }
  }, [isAuthenticated]);

  const logout = (shouldRedirect = true) => {
    setUser(null);
    setIsAuthenticated(false);
    base44.auth.logout(shouldRedirect ? window.location.href : undefined);
  };

  const navigateToLogin = () => base44.auth.redirectToLogin(window.location.pathname + window.location.search);

  const checkUserAuth = async () => {
    const { data } = await supabase.auth.getSession();
    await refresh(data.session);
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isLoadingAuth,
      isLoadingPublicSettings: false,
      authError: null,
      appPublicSettings: null,
      authChecked,
      logout,
      navigateToLogin,
      checkUserAuth,
      checkAppState: checkUserAuth,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
