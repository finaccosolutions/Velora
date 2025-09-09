// src/hooks/useSupabaseAuth.ts
import { useState, useEffect, useCallback, useRef } from 'react';
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
  const isVisible = useDocumentVisibility(); // Call useDocumentVisibility here

    useEffect(() => {
    console.log('useSupabaseAuth: User state changed:', user);
    console.log('useSupabaseAuth: UserProfile state changed:', userProfile);
  }, [user, userProfile]);

  // Internal helper function to fetch user profile
 const _fetchUserProfile = async (authUser: User): Promise<UserProfile | null> => {
    console.log('_fetchUserProfile: Attempting to fetch profile for userId:', authUser.id);
    try {
      console.log('_fetchUserProfile: Before Supabase query for profile. authUser:', authUser);

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single();

      // NEW LOG: Log the direct result of the Supabase query
      console.log('_fetchUserProfile: Supabase query executed for profile. Raw Data:', data, 'Raw Error:', error);

      if (error) {
        if (error.code === 'PGRST116') { // No rows found
          console.warn('_fetchUserProfile: No user profile found in public.users. Attempting to create one.');
          console.log('_fetchUserProfile: authUser.user_metadata:', authUser.user_metadata);

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
            console.error('_fetchUserProfile: Error creating new user profile:', JSON.stringify(insertError, null, 2));
            // NEW LOG: Log return value on insert error
            console.log('_fetchUserProfile: Returning null due to insert error.');
            return null; // Return null on error
          } else {
            console.log('_fetchUserProfile: New user profile created successfully. Returning:', newProfile);
            // NEW LOG: Log return value on successful insert
            console.log('_fetchUserProfile: Returning newProfile after successful insert.');
            return newProfile; // Return the new profile
          }
        } else {
          console.error('_fetchUserProfile: Error during profile fetch (not "no rows found"):', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
          // NEW LOG: Log return value on other fetch errors
          console.log('_fetchUserProfile: Returning null due to other fetch error.');
          return null; // Return null on other errors
        }
      } else { // Profile found
        console.log('_fetchUserProfile: User profile fetched successfully. Returning:', data);
        // NEW LOG: Log return value on successful fetch
        console.log('_fetchUserProfile: Returning fetched data.');
        return data; // Return the fetched profile
      }
    } catch (outerError: any) {
      console.error('_fetchUserProfile: Caught unexpected exception in outer catch block:', JSON.stringify(outerError, Object.getOwnPropertyNames(outerError), 2));
      // NEW LOG: Log return value on outer exception
      console.log('_fetchUserProfile: Returning null due to outer exception.');
      return null; // Return null on exception
    }
  };

  // Unified function to handle auth state changes and fetch user profile
  const handleAuth = async (currentSession: Session | null, eventType: string = 'INITIAL_LOAD') => {
    console.log(`handleAuth: Event Type: ${eventType}, Session received:`, currentSession);
    setLoading(true); // Set loading to true at the start of auth handling
    setSession(currentSession);
    setUser(currentSession?.user ?? null); // Set user state
    console.log(`handleAuth: User set to:`, currentSession?.user ?? null);

    let profile: UserProfile | null = null; // Local variable to hold the fetched profile
    if (currentSession?.user) {
      console.log('handleAuth: User present, proceeding to fetch profile.');
      profile = await _fetchUserProfile(currentSession.user); // Call _fetchUserProfile and get its return value
    } else {
      console.log('handleAuth: No user session found, clearing profile.');
      // No need to set userProfile to null here, it will be set below
    }
    setUserProfile(profile); // Set userProfile state with the fetched/created profile

    setLoading(false); // Set loading to false AFTER profile handling is complete
    console.log('handleAuth: Auth process completed. Loading set to false.');
    // Log the actual state variables after they've been set and React has potentially re-rendered
    console.log('handleAuth: Final user state (from currentSession):', currentSession?.user ?? null);
    console.log('handleAuth: Final userProfile state (from local variable):', profile);
    // NEW LOG ADDED HERE
    console.log('handleAuth: After setLoading(false) - Current user state:', user, 'Current userProfile state:', userProfile);
  };

  // Effect for initial session check and subscribing to auth state changes
  useEffect(() => {
    console.log('Auth useEffect: Initializing Supabase auth listener...');
    const setupAuth = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        console.log('Auth useEffect: getSession result (initial load):', initialSession);
        await handleAuth(initialSession, 'INITIAL_GET_SESSION');
      } catch (error) {
        console.error('Auth useEffect: Error during initial session check:', error);
        await handleAuth(null, 'INITIAL_GET_SESSION_ERROR');
      }
    };

    setupAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth State Change Listener: Event:', event, 'Session:', session);
        await handleAuth(session, event);
      }
    );

    return () => {
      console.log('Auth useEffect: Cleaning up auth subscription.');
      subscription.unsubscribe();
    };
  }, []);

  // Effect to refresh session when tab becomes visible
  useEffect(() => {
    console.log('Visibility useEffect: isVisible:', isVisible, 'session:', session);
    if (isVisible && session) {
      console.log('Visibility useEffect: Tab became visible and session exists, attempting to refresh session...');
      supabase.auth.refreshSession().then(async ({ data, error }) => {
        if (error) {
          console.error('Visibility useEffect: Error refreshing session:', error);
          await handleAuth(null, 'REFRESH_SESSION_ERROR');
        } else if (data.session) {
          console.log('Visibility useEffect: Session refreshed successfully:', data.session);
          await handleAuth(data.session, 'REFRESH_SESSION_SUCCESS');
        } else {
          console.log('Visibility useEffect: Session refresh returned no session, user might be logged out.');
          await handleAuth(null, 'REFRESH_SESSION_NO_SESSION');
        }
      }).catch(err => {
        console.error('Visibility useEffect: Caught error during session refresh:', err);
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

      console.log('signUp: Supabase signUp result - Data:', data, 'Error:', error);

      if (error) {
        return { data: null, error };
      }

      // onAuthStateChange listener will handle state updates
      return { data, error: null };
    } catch (error: any) {
      console.error('signUp: Caught unexpected error during sign up:', error);
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
      console.log('signIn: Supabase signIn result - Data:', data, 'Error:', error);
      return { data, error };
    } catch (error: any) {
      console.error('signIn: Caught unexpected error during sign in:', error);
      return { data: null, error };
    }
  };

  const signOut = async () => {
    let signOutError = null;
    try {
      console.log('signOut: Attempting to sign out user from Supabase.');
      console.log('signOut: ABOUT TO EXECUTE SUPABASE AUTH SIGN OUT.');

      // Clear local state immediately
      setUser(null);
      setSession(null);
      setUserProfile(null);
      setLoading(false);

      // Await the signOut call directly without Promise.race
      const { error } = await supabase.auth.signOut();

      console.log('signOut: Result of supabase.auth.signOut() - Error:', error);
      if (error) {
        console.error('signOut: Error during sign out:', error);
        console.error('signOut: Error details:', JSON.stringify(error, null, 2));
        signOutError = error;
      } else {
        console.log('signOut: User signed out successfully from Supabase.');
      }
    } catch (error: any) {
      console.error('signOut: Caught unexpected error during sign out:', error.message); // Log the message
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
    } catch (error: any) {
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
    isVisible, // Return isVisible
  };
};

