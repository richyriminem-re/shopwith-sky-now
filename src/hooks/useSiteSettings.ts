import { useState, useEffect } from 'react';
import { getAllSiteSettings, clearSiteSettingsCache } from '@/lib/siteSettings';

export const useSiteSettings = () => {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSettings = async () => {
      setLoading(true);
      const data = await getAllSiteSettings();
      setSettings(data);
      setLoading(false);
    };

    loadSettings();

    // Listen for settings updates from admin panel
    const handleSettingsUpdate = () => {
      loadSettings();
    };

    window.addEventListener('site-settings-updated', handleSettingsUpdate);

    return () => {
      window.removeEventListener('site-settings-updated', handleSettingsUpdate);
      clearSiteSettingsCache();
    };
  }, []);

  return { settings, loading };
};
