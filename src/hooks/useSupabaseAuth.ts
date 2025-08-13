// src/hooks/useSupabaseAuth.ts
import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

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

  useEffect(() => {
    console.log('Auth useEffect: Initializing...');
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Auth useEffect: getSession result:', session);
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        console.log('Auth useEffect: User found, fetching profile for:', session.user.id);
        fetchUserProfile(session.user.id);
      } else {
        console.log('Auth useEffect: No user session found.');
        setLoading(false);
      }
    }).catch(error => {
      console.error('Auth useEffect: Error getting session:', error);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth State Change:', event, session);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          console.log('Auth State Change: User found, fetching profile for:', session.user.id);
          await fetchUserProfile(session.user.id);
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
  }, []);

 const fetchUserProfile = async (userId: string) => {
  try {
    console.log('fetchUserProfile: Attempting to fetch profile for userId:', userId);
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    // --- THESE ARE THE CRUCIAL LINES I NEED TO SEE THE OUTPUT OF ---
    console.log('fetchUserProfile: Supabase query result - data:', data);
    console.log('fetchUserProfile: Supabase query result - error:', error);
    // --- END CRUCIAL LINES ---

    if (error) {
      console.error('fetchUserProfile: Error fetching user profile:', error);
    } else {
      console.log('fetchUserProfile: User profile fetched:', data);
      setUserProfile(data);
    }
  } catch (error) {
    console.error('fetchUserProfile: Catch block error fetching user profile:', error);
  } finally {
    console.log('fetchUserProfile: Setting loading to false.');
    setLoading(false);
  }
};

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
      if (data.user) {
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
          // Optionally, you might want to roll back the auth.users entry or handle this error differently
          throw profileError; // Re-throw to indicate overall sign-up failure
        }
      }

      console.log('signUp: User signed up successfully and profile created:', data);
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
    console.log('signOut: Attempting to sign out user.');
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('signOut: Error during sign out:', error);
    } else {
      console.log('signOut: User signed out successfully.');
      // Explicitly clear state after successful sign out
      setUser(null);
      setUserProfile(null);
      setSession(null);
      setLoading(false);
    }
    return { error };
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

