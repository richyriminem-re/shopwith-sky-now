import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { getAllSiteSettings, updateSiteSetting } from '@/lib/siteSettings';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Upload, Image as ImageIcon } from 'lucide-react';

const AdminSiteSettings = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [settings, setSettings] = useState<Record<string, string>>({});

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    const data = await getAllSiteSettings();
    setSettings(data);
    setLoading(false);
  };

  const handleUpdate = async (key: string, value: string) => {
    setSaving(key);
    try {
      await updateSiteSetting(key, value);
      toast({
        title: 'Success',
        description: 'Setting updated successfully',
      });
      await loadSettings();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update setting',
        variant: 'destructive',
      });
    } finally {
      setSaving(null);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Error',
        description: 'Please upload an image file',
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `logo-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      await handleUpdate('site_logo_url', publicUrl);
      
      toast({
        title: 'Success',
        description: 'Logo uploaded successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to upload logo',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Site Settings</h1>
        <p className="text-muted-foreground">Manage your home page configuration</p>
      </div>

      {/* Header Section */}
      <Card>
        <CardHeader>
          <CardTitle>Header Settings</CardTitle>
          <CardDescription>Configure your site logo</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Current Logo</Label>
            {settings.site_logo_url && (
              <div className="flex items-center gap-4">
                <img 
                  src={settings.site_logo_url} 
                  alt="Site Logo" 
                  className="h-16 w-auto object-contain bg-muted p-2 rounded"
                />
              </div>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="logo-upload">Upload New Logo</Label>
            <div className="flex gap-2">
              <Input
                id="logo-upload"
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                disabled={uploading}
                className="flex-1"
              />
              {uploading && <Loader2 className="h-4 w-4 animate-spin" />}
            </div>
            <p className="text-sm text-muted-foreground">Recommended: PNG or SVG format, transparent background</p>
          </div>
        </CardContent>
      </Card>

      {/* Call Bar Section */}
      <Card>
        <CardHeader>
          <CardTitle>Call to Order Section</CardTitle>
          <CardDescription>Configure the call bar phone number</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="call_bar_phone">Phone Number</Label>
            <div className="flex gap-2">
              <Input
                id="call_bar_phone"
                value={settings.call_bar_phone || ''}
                onChange={(e) => setSettings({ ...settings, call_bar_phone: e.target.value })}
                placeholder="+234 905 777 5190"
              />
              <Button
                onClick={() => handleUpdate('call_bar_phone', settings.call_bar_phone)}
                disabled={saving === 'call_bar_phone'}
              >
                {saving === 'call_bar_phone' ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Footer Contact Section */}
      <Card>
        <CardHeader>
          <CardTitle>Footer Contact Information</CardTitle>
          <CardDescription>Update your contact details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="footer_company_name">Company Name</Label>
            <div className="flex gap-2">
              <Input
                id="footer_company_name"
                value={settings.footer_company_name || ''}
                onChange={(e) => setSettings({ ...settings, footer_company_name: e.target.value })}
              />
              <Button
                onClick={() => handleUpdate('footer_company_name', settings.footer_company_name)}
                disabled={saving === 'footer_company_name'}
              >
                {saving === 'footer_company_name' ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save'}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="footer_company_description">Company Description</Label>
            <div className="flex gap-2">
              <Textarea
                id="footer_company_description"
                value={settings.footer_company_description || ''}
                onChange={(e) => setSettings({ ...settings, footer_company_description: e.target.value })}
                rows={3}
              />
              <Button
                onClick={() => handleUpdate('footer_company_description', settings.footer_company_description)}
                disabled={saving === 'footer_company_description'}
              >
                {saving === 'footer_company_description' ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save'}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="footer_phone">Phone Number</Label>
            <div className="flex gap-2">
              <Input
                id="footer_phone"
                value={settings.footer_phone || ''}
                onChange={(e) => setSettings({ ...settings, footer_phone: e.target.value })}
              />
              <Button
                onClick={() => handleUpdate('footer_phone', settings.footer_phone)}
                disabled={saving === 'footer_phone'}
              >
                {saving === 'footer_phone' ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save'}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="footer_email">Email Address</Label>
            <div className="flex gap-2">
              <Input
                id="footer_email"
                type="email"
                value={settings.footer_email || ''}
                onChange={(e) => setSettings({ ...settings, footer_email: e.target.value })}
              />
              <Button
                onClick={() => handleUpdate('footer_email', settings.footer_email)}
                disabled={saving === 'footer_email'}
              >
                {saving === 'footer_email' ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save'}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="footer_address">Physical Address</Label>
            <div className="flex gap-2">
              <Textarea
                id="footer_address"
                value={settings.footer_address || ''}
                onChange={(e) => setSettings({ ...settings, footer_address: e.target.value })}
                rows={2}
              />
              <Button
                onClick={() => handleUpdate('footer_address', settings.footer_address)}
                disabled={saving === 'footer_address'}
              >
                {saving === 'footer_address' ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Social Links Section */}
      <Card>
        <CardHeader>
          <CardTitle>Social & Communication Links</CardTitle>
          <CardDescription>Configure your social media and messaging links</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="footer_whatsapp_group">WhatsApp Group Link</Label>
            <div className="flex gap-2">
              <Input
                id="footer_whatsapp_group"
                value={settings.footer_whatsapp_group || ''}
                onChange={(e) => setSettings({ ...settings, footer_whatsapp_group: e.target.value })}
                placeholder="https://chat.whatsapp.com/..."
              />
              <Button
                onClick={() => handleUpdate('footer_whatsapp_group', settings.footer_whatsapp_group)}
                disabled={saving === 'footer_whatsapp_group'}
              >
                {saving === 'footer_whatsapp_group' ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save'}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="footer_whatsapp_contact">WhatsApp Contact Link</Label>
            <div className="flex gap-2">
              <Input
                id="footer_whatsapp_contact"
                value={settings.footer_whatsapp_contact || ''}
                onChange={(e) => setSettings({ ...settings, footer_whatsapp_contact: e.target.value })}
                placeholder="https://wa.me/..."
              />
              <Button
                onClick={() => handleUpdate('footer_whatsapp_contact', settings.footer_whatsapp_contact)}
                disabled={saving === 'footer_whatsapp_contact'}
              >
                {saving === 'footer_whatsapp_contact' ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save'}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="footer_instagram">Instagram URL</Label>
            <div className="flex gap-2">
              <Input
                id="footer_instagram"
                value={settings.footer_instagram || ''}
                onChange={(e) => setSettings({ ...settings, footer_instagram: e.target.value })}
                placeholder="https://instagram.com/..."
              />
              <Button
                onClick={() => handleUpdate('footer_instagram', settings.footer_instagram)}
                disabled={saving === 'footer_instagram'}
              >
                {saving === 'footer_instagram' ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save'}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="footer_tiktok">TikTok URL</Label>
            <div className="flex gap-2">
              <Input
                id="footer_tiktok"
                value={settings.footer_tiktok || ''}
                onChange={(e) => setSettings({ ...settings, footer_tiktok: e.target.value })}
                placeholder="https://tiktok.com/@..."
              />
              <Button
                onClick={() => handleUpdate('footer_tiktok', settings.footer_tiktok)}
                disabled={saving === 'footer_tiktok'}
              >
                {saving === 'footer_tiktok' ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Copyright Section */}
      <Card>
        <CardHeader>
          <CardTitle>Footer Copyright</CardTitle>
          <CardDescription>Configure your copyright text</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="footer_copyright_text">Copyright Text</Label>
            <div className="flex gap-2">
              <Input
                id="footer_copyright_text"
                value={settings.footer_copyright_text || ''}
                onChange={(e) => setSettings({ ...settings, footer_copyright_text: e.target.value })}
                placeholder="Shop With Sky. All rights reserved."
              />
              <Button
                onClick={() => handleUpdate('footer_copyright_text', settings.footer_copyright_text)}
                disabled={saving === 'footer_copyright_text'}
              >
                {saving === 'footer_copyright_text' ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save'}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">Preview: © {new Date().getFullYear()} {settings.footer_copyright_text}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSiteSettings;
