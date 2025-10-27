import { supabase } from '@/integrations/supabase/client';

const CACHE_KEY = 'site_settings_cache';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

interface CachedSettings {
  data: Record<string, string>;
  timestamp: number;
}

export const getSiteSetting = async (key: string): Promise<string | null> => {
  try {
    const { data, error } = await supabase
      .from('site_settings')
      .select('setting_value')
      .eq('setting_key', key)
      .maybeSingle();

    if (error) throw error;
    return data?.setting_value || null;
  } catch (error) {
    console.error(`Error fetching site setting ${key}:`, error);
    return null;
  }
};

export const getAllSiteSettings = async (): Promise<Record<string, string>> => {
  try {
    // Check cache first
    const cached = sessionStorage.getItem(CACHE_KEY);
    if (cached) {
      const { data, timestamp }: CachedSettings = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_DURATION) {
        return data;
      }
    }

    const { data, error } = await supabase
      .from('site_settings')
      .select('setting_key, setting_value');

    if (error) throw error;

    const settings: Record<string, string> = {};
    data?.forEach((setting) => {
      settings[setting.setting_key] = setting.setting_value;
    });

    // Cache the settings
    const cacheData: CachedSettings = {
      data: settings,
      timestamp: Date.now(),
    };
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));

    return settings;
  } catch (error) {
    console.error('Error fetching site settings:', error);
    return {};
  }
};

export const updateSiteSetting = async (key: string, value: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('site_settings')
      .upsert(
        { setting_key: key, setting_value: value, updated_at: new Date().toISOString() },
        { onConflict: 'setting_key' }
      );

    if (error) throw error;
    clearSiteSettingsCache();
  } catch (error) {
    console.error(`Error updating site setting ${key}:`, error);
    throw error;
  }
};

export const clearSiteSettingsCache = (): void => {
  sessionStorage.removeItem(CACHE_KEY);
  // Notify all components to refresh settings
  window.dispatchEvent(new CustomEvent('site-settings-updated'));
};
