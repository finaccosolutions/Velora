// src/hooks/useSupabaseAuth.ts
import { useState, useEffect, useCallback } from 'react'; // Added useCallback
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
  const [loading, setLoading] = useState(true); // Initial state is loading
  const isVisible = useDocumentVisibility();

  // Memoize fetchUserProfile to prevent unnecessary re-creations
  const fetchUserProfile = useCallback(async (authUser: User) => {
    try {
      console.log('fetchUserProfile: Attempting to fetch profile for userId:', authUser.id);
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single();

      console.log('fetchUserProfile: Supabase query result - data:', data);
      console.log('fetchUserProfile: Supabase query result - error:', error);

      if (error) {
        if (error.code === 'PGRST116') { // "no rows found"
          console.warn('fetchUserProfile: No user profile found in public.users. Attempting to create one.');
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
            console.error('fetchUserProfile: Error creating new user profile:', insertError);
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
        console.log('fetchUserProfile: User profile fetched:', data);
        setUserProfile(data);
      }
    } catch (outerError: any) {
      console.error('fetchUserProfile: Unexpected error in outer catch block:', outerError.message);
      setUserProfile(null);
    }
  }, []); // No dependencies, as it only uses authUser and supabase instance

  useEffect(() => {
    console.log('Auth useEffect: Initializing...');
    const handleAuthInitialization = async () => {
      setLoading(true); // Ensure loading is true at the very start
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
          setUserProfile(null); // Explicitly set to null if no user
        }
      } catch (error) {
        console.error('Auth useEffect: Error during initial session check:', error);
        setUserProfile(null); // Ensure null on error
      } finally {
        setLoading(false); // Set loading false only after initial session and profile check is complete
      }
    };

    handleAuthInitialization();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth State Change:', event, session);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          setLoading(true); // Set loading true when auth state changes and user is present
          console.log('Auth State Change: User found, fetching profile for:', session.user.id);
          await fetchUserProfile(session.user); 
          setLoading(false); // Set loading false after profile fetch
        } else {
          console.log('Auth State Change: No user session found, clearing profile.');
          setUserProfile(null);
          setLoading(false); // Set loading false when user logs out
        }
      }
    );

    return () => {
      console.log('Auth useEffect: Cleaning up subscription.');
      subscription.unsubscribe();
    };
  }, [fetchUserProfile]); // Add fetchUserProfile to dependencies because it's used inside

  // New useEffect to refresh session when tab becomes visible
  useEffect(() => {
    if (isVisible && session) {
      console.log('Tab became visible and session exists, attempting to refresh session...');
      supabase.auth.refreshSession().then(({ data, error }) => {
        if (error) {
          console.error('Error refreshing session:', error);
        } else if (data.session) {
          console.log('Session refreshed successfully:', data.session);
          // The onAuthStateChange listener should pick this up and update state
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

      if (error) throw error;

      // Explicitly insert user profile into public.users table
      // This part is now somewhat redundant with the fetchUserProfile fallback,
      // but it's good to keep for immediate profile creation on sign-up.
      if (data.user) {
        console.log('signUp: Attempting to insert user profile into public.users...');
        const { error: profileError } = await supabase
          .from('users')
          .insert({
            id: data.user.id,
            email: data.user.email!,
            full_name: fullName,
            phone: phone || null,
            is_admin: false // Default to false for new sign-ups
          });

        if (profileError) {
          console.error('signUp: Error inserting user profile into public.users:', profileError);
          // --- MODIFIED: Re-throw error to make profile creation mandatory ---
          throw profileError; 
        }
        console.log('signUp: User profile inserted into public.users successfully.');
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
    try {
      console.log('signOut: Attempting to sign out user.');
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('signOut: Error during sign out:', error);
      } else {
        console.log('signOut: User signed out successfully.');
      }
    } catch (error: any) {
      console.error('signOut: Caught error during sign out:', error.message);
    } finally {
      console.log('signOut: Clearing local state and setting loading to false.');
      setUser(null);
      setUserProfile(null);
      setSession(null);
      setLoading(false);
    }
    return { error: null }; // Return null error as local state is cleared
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
