// src/hooks/useSiteSettings.ts
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

// Define a generic type for settings value, as it's jsonb
interface SiteSetting {
  id: string;
  key: string;
  value: any; // Can be any JSON-serializable object
  created_at: string;
  updated_at: string;
}

export const useSiteSettings = () => {
  const [settings, setSettings] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, isAdmin, loading: authLoading } = useAuth();

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('site_settings')
        .select('*');

      if (fetchError) {
        throw fetchError;
      }

      const fetchedSettings: Record<string, any> = {};
      data.forEach((setting: SiteSetting) => {
        fetchedSettings[setting.key] = setting.value;
      });
      setSettings(fetchedSettings);
    } catch (err: any) {
      console.error('Error fetching site settings:', err.message);
      setError(err.message);
      setSettings({});
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading) {
      fetchSettings();
    }
  }, [authLoading, fetchSettings]);

  const updateSetting = async (key: string, value: any) => {
    // This check remains, as only admins should be able to UPDATE settings
    if (!user || !isAdmin) return { data: null, error: new Error('Unauthorized') };
    try {
      const { data, error: upsertError } = await supabase
        .from('site_settings')
        .upsert(
          { key, value },
          { onConflict: 'key' } // Update if key exists, insert if not
        )
        .select()
        .single();

      if (upsertError) throw upsertError;
      
      // Update local state immediately
      setSettings(prev => ({ ...prev, [key]: value }));
      return { data, error: null };
    } catch (err: any) {
      console.error(`Error updating setting '${key}':`, err.message);
      return { data: null, error: err };
    }
  };

  return {
    settings,
    loading,
    error,
    fetchSettings,
    updateSetting,
  };
};
