// src/hooks/useSupabaseAuth.ts
import { useState, useEffect, useCallback } from 'react';
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

  const fetchUserProfile = useCallback(async (authUser: User) => {
    try {
      console.log('fetchUserProfile: Attempting to fetch profile for userId:', authUser.id);
      console.log('fetchUserProfile: Before Supabase query for profile.');
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single();
      // THIS IS THE CRITICAL LINE WE NEED TO SEE OUTPUT FROM:
      console.log('fetchUserProfile: Supabase query result for profile - Data:', data, 'Error:', error);

      if (error) {
        if (error.code === 'PGRST116') {
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
            .single();

          if (insertError) {
            console.error('fetchUserProfile: Error creating new user profile:', JSON.stringify(insertError, null, 2));
            setUserProfile(null);
          } else {
            console.log('fetchUserProfile: New user profile created successfully:', newProfile);
            setUserProfile(newProfile);
          }
        } else {
          console.error('fetchUserProfile: Error fetching user profile:', error);
          setUserProfile(null);
        }
      } else {
        console.log('fetchUserProfile: User profile fetched successfully:', data);
        setUserProfile(data);
      }
    } catch (outerError: any) {
      console.error('fetchUserProfile: Caught exception in outer catch block:', outerError.message);
      setUserProfile(null);
    }
  }, []);

  useEffect(() => {
    console.log('Auth useEffect: Initializing...');
    const handleAuthInitialization = async () => {
      setLoading(true);
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        console.log('Auth useEffect: getSession result:', initialSession);
        setSession(initialSession);
        setUser(initialSession?.user ?? null);

        if (initialSession?.user) {
          console.log('Auth useEffect: User found, fetching profile for:', initialSession.user.id);
          await fetchUserProfile(initialSession.user);
        } else {
          console.log('Auth useEffect: No user session found.');
          setUserProfile(null);
        }
      } catch (error) {
        console.error('Auth useEffect: Error during initial session check:', error);
        setUserProfile(null);
      } finally {
        setLoading(false);
      }
    };

    handleAuthInitialization();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth State Change:', event, session);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          setLoading(true);
          console.log('Auth State Change: User found, fetching profile for:', session.user.id);
          await fetchUserProfile(session.user); 
          setLoading(false);
        } else {
          console.log('Auth State Change: No user session found, clearing profile.');
          setUserProfile(null);
          setLoading(false);
        }
      }
    );

    return () => {
      console.log('Auth useEffect: Cleaning up subscription.');
      subscription.unsubscribe();
    };
  }, [fetchUserProfile]);

  // New useEffect to refresh session when tab becomes visible
  useEffect(() => {
    if (isVisible && session) {
      console.log('Tab became visible and session exists, attempting to refresh session...');
      setLoading(true); // Set loading to true before starting the refresh process
      supabase.auth.refreshSession().then(async ({ data, error }) => {
        if (error) {
          console.error('Error refreshing session:', error);
          // If there's an error refreshing, it might mean the session is truly invalid.
          // Clear state and set loading to false.
          setUser(null);
          setUserProfile(null);
          setSession(null);
          setLoading(false);
        } else if (data.session) {
          console.log('Session refreshed successfully:', data.session);
          // Explicitly update state and fetch profile
          setSession(data.session);
          setUser(data.session.user);
          await fetchUserProfile(data.session.user); // Call fetchUserProfile directly
          setLoading(false); // Set loading to false after profile fetch
        } else {
          console.log('Session refresh returned no session, user might be logged out.');
          // If refresh returns no session, it implies the session is truly invalid or expired.
          // Explicitly clear state to reflect logged-out status.
          setUser(null);
          setUserProfile(null);
          setSession(null);
          setLoading(false);
        }
      }).catch(err => {
        console.error('Caught error during session refresh:', err);
        // Ensure loading is set to false even if an unexpected error occurs
        setLoading(false);
      });
    }
  }, [isVisible, session, fetchUserProfile]);

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

      // If there's a direct error from Supabase (e.g., invalid email format)
      if (error) {
        console.error('signUp: Error during sign up:', error);
        return { data: null, error };
      }

      // If no user data is returned and no explicit error, it means the email already exists
      // Supabase intentionally doesn't return an error here for security reasons (email enumeration prevention)
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
  } finally {
    console.log('signOut: Clearing local state (user, userProfile, session, loading).');
    setUser(null);
    setUserProfile(null);
    setSession(null);
    setLoading(false);
    console.log('signOut: Local state cleared.');
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
