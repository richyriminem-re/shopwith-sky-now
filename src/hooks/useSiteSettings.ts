import { useState, useEffect } from 'react';
import { getAllSiteSettings, clearSiteSettingsCache } from '@/lib/siteSettings';

export const useSiteSettings = () => {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSettings = async () => {
      const data = await getAllSiteSettings();
      setSettings(data);
      setLoading(false);
    };

    loadSettings();

    return () => {
      clearSiteSettingsCache();
    };
  }, []);

  return { settings, loading };
};
