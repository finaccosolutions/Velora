// src/hooks/useSupabaseAuth.ts
import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { useDocumentVisibility } from './useDocumentVisibility';

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  is_admin: boolean;
}

export const useSupabaseAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const isVisible = useDocumentVisibility();

  // Internal helper function to fetch user profile
  const _fetchUserProfile = async (authUser: User) => {
    try {
      console.log('fetchUserProfile: Attempting to fetch profile for userId:', authUser.id);
      console.log('fetchUserProfile: Before Supabase query for profile.');
      console.log('fetchUserProfile: About to execute supabase.from("users").select("*")...');

      // Diagnostic: Log current Supabase auth state before query
      const { data: currentSessionData } = await supabase.auth.getSession();
      const { data: currentUserData } = await supabase.auth.getUser();
      console.log('fetchUserProfile: Supabase.auth.getSession() result before query:', currentSessionData.session);
      console.log('fetchUserProfile: Supabase.auth.getUser() result before query:', currentUserData.user);

      // Diagnostic: Introduce a small delay to check for race conditions
      await new Promise(resolve => setTimeout(resolve, 100)); // 100ms delay

      // Wrap the Supabase query in a Promise.race with a timeout
      const queryPromise = supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .limit(1); // Use limit(1) for robustness

      const timeoutPromise = new Promise((resolve, reject) =>
        setTimeout(() => reject(new Error('Supabase profile query timed out after 5 seconds')), 5000)
      );

      const { data, error } = await Promise.race([queryPromise, timeoutPromise]);

      console.log('fetchUserProfile: Supabase query executed for profile.');
      console.log('fetchUserProfile: Supabase query result for profile - Data:', data, 'Error:', error);

      if (error) {
        // This will catch both Supabase errors and our timeout error
        console.error('fetchUserProfile: Error or Timeout during profile fetch:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
        setUserProfile(null);
      } else if (!data || data.length === 0) {
        console.warn('fetchUserProfile: No user profile found in public.users. Attempting to create one.');
        console.log('fetchUserProfile: authUser.user_metadata:', authUser.user_metadata);
        console.log('fetchUserProfile: Attempting to insert new profile...');

        const { data: newProfile, error: insertError } = await supabase
          .from('users')
          .insert({
            id: authUser.id,
            email: authUser.email!,
            full_name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'New User',
            phone: authUser.user_metadata?.phone || null,
            is_admin: false,
          })
          .select()
          .single(); // Keep .single() here as we expect exactly one new row

        if (insertError) {
          console.error('fetchUserProfile: Error creating new user profile:', JSON.stringify(insertError, null, 2));
          setUserProfile(null);
        } else {
          console.log('fetchUserProfile: New user profile created successfully:', newProfile);
          setUserProfile(newProfile);
        }
      } else { // Check if data exists and is not empty
        console.log('fetchUserProfile: User profile fetched successfully:', data[0]);
        setUserProfile(data[0]);
      }
    } catch (outerError: any) {
      console.error('fetchUserProfile: Caught unexpected exception in outer catch block:', JSON.stringify(outerError, Object.getOwnPropertyNames(outerError), 2)); // Log full error object
      setUserProfile(null);
    }
  };

  // Unified function to handle auth state changes and fetch user profile
  const handleAuth = async (currentSession: Session | null) => {
    setLoading(true);
    setSession(currentSession);
    setUser(currentSession?.user ?? null);

    if (currentSession?.user) {
      console.log('handleAuth: User found, fetching profile for:', currentSession.user.id);
      await _fetchUserProfile(currentSession.user);
    } else {
      console.log('handleAuth: No user session found, clearing profile.');
      setUserProfile(null);
    }
    setLoading(false);
  };

  // Effect for initial session check and subscribing to auth state changes
  useEffect(() => {
    console.log('Auth useEffect: Initializing...');
    const setupAuth = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        console.log('Auth useEffect: getSession result:', initialSession);
        await handleAuth(initialSession);
      } catch (error) {
        console.error('Auth useEffect: Error during initial session check:', error);
        await handleAuth(null);
      }
    };

    setupAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth State Change:', event, session);
        await handleAuth(session);
      }
    );

    return () => {
      console.log('Auth useEffect: Cleaning up subscription.');
      subscription.unsubscribe();
    };
  }, []);

  // Effect to refresh session when tab becomes visible
  useEffect(() => {
    if (isVisible && session) {
      console.log('Tab became visible and session exists, attempting to refresh session...');
      supabase.auth.refreshSession().then(async ({ data, error }) => {
        if (error) {
          console.error('Error refreshing session:', error);
          await handleAuth(null);
        } else if (data.session) {
          console.log('Session refreshed successfully:', data.session);
          await handleAuth(data.session);
        } else {
          console.log('Session refresh returned no session, user might be logged out.');
          await handleAuth(null);
        }
      }).catch(err => {
        console.error('Caught error during session refresh:', err);
      });
    }
  }, [isVisible, session]);

  const signUp = async (email: string, password: string, fullName: string, phone?: string) => {
    try {
      console.log('signUp: Attempting to sign up user:', email);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            phone: phone || null,
          }
        }
      });

      if (error) {
        console.error('signUp: Error during sign up:', error);
        return { data: null, error };
      }

      if (!data.user) {
        console.warn('signUp: Attempted to sign up with existing email. Returning custom error.');
        return { data: null, error: new Error('An account with this email already exists. Please try logging in or resetting your password.') };
      }

      console.log('signUp: User signed up successfully and profile created (or attempted):', data);
      return { data, error: null };
    } catch (error) {
      console.error('signUp: Error during sign up:', error);
      return { data: null, error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log('signIn: Attempting to sign in user:', email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      console.log('signIn: Sign in result:', data);
      return { data, error };
    } catch (error) {
      console.error('signIn: Error during sign in:', error);
      return { data: null, error };
    }
  };

  const signOut = async () => {
    let signOutError = null;
    try {
      console.log('signOut: Attempting to sign out user.');
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('signOut: Error during sign out:', error);
        console.error('signOut: Error details:', JSON.stringify(error, null, 2));
        signOutError = error;
      } else {
        console.log('signOut: User signed out successfully from Supabase.');
      }
    } catch (error: any) {
      console.error('signOut: Caught unexpected error during sign out:', error);
      console.error('signOut: Caught unexpected error details:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
      signOutError = error;
    }
    return { error: signOutError };
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) {
      console.error('updateProfile: No user logged in to update profile.');
      return { error: new Error('No user logged in') };
    }

    try {
      console.log('updateProfile: Attempting to update profile for user:', user.id, updates);
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;
      console.log('updateProfile: Profile updated successfully:', data);
      setUserProfile(data);
      return { data, error: null };
    } catch (error) {
      console.error('updateProfile: Error during profile update:', error);
      return { data: null, error };
    }
  };

  return {
    user,
    userProfile,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
  };
};
