import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, Trash2, Eye, EyeOff, GripVertical, Image as ImageIcon } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface HeroSlide {
  id: string;
  title: string;
  description: string | null;
  image_url: string;
  webp_url: string | null;
  alt_text: string | null;
  link_url: string | null;
  link_text: string | null;
  link_target: string;
  cta_position: string | null;
  cta_size: string;
  is_active: boolean;
  display_order: number;
}

export default function AdminHeroSlides() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image_url: '',
    webp_url: '',
    alt_text: '',
    link_url: '',
    link_text: '',
    link_target: '_self',
    cta_position: 'bottom-center',
    cta_size: 'default',
    is_active: true,
    display_order: 0
  });

  useEffect(() => {
    fetchSlides();
  }, []);

  const fetchSlides = async () => {
    try {
      const { data, error } = await supabase
        .from('hero_slides')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setSlides(data || []);
    } catch (error) {
      console.error('Error fetching slides:', error);
      toast({
        title: 'Error',
        description: 'Failed to load hero slides',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file',
        description: 'Please upload an image file',
        variant: 'destructive'
      });
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Image must be less than 5MB',
        variant: 'destructive'
      });
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `hero/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      setFormData(prev => ({ ...prev, image_url: publicUrl }));
      
      toast({
        title: 'Success',
        description: 'Image uploaded successfully'
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: 'Upload failed',
        description: 'Failed to upload image',
        variant: 'destructive'
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.image_url) {
      toast({
        title: 'Missing image',
        description: 'Please upload an image',
        variant: 'destructive'
      });
      return;
    }

    try {
      if (editingId) {
        const { error } = await supabase
          .from('hero_slides')
          .update(formData)
          .eq('id', editingId);

        if (error) throw error;
        toast({ title: 'Success', description: 'Slide updated successfully' });
      } else {
        const { error } = await supabase
          .from('hero_slides')
          .insert([formData]);

        if (error) throw error;
        toast({ title: 'Success', description: 'Slide created successfully' });
      }

      resetForm();
      fetchSlides();
    } catch (error) {
      console.error('Error saving slide:', error);
      toast({
        title: 'Error',
        description: 'Failed to save slide',
        variant: 'destructive'
      });
    }
  };

  const handleEdit = (slide: HeroSlide) => {
    setEditingId(slide.id);
    setFormData({
      title: slide.title,
      description: slide.description || '',
      image_url: slide.image_url,
      webp_url: slide.webp_url || '',
      alt_text: slide.alt_text || '',
      link_url: slide.link_url || '',
      link_text: slide.link_text || '',
      link_target: slide.link_target,
      cta_position: slide.cta_position || 'bottom-center',
      cta_size: slide.cta_size,
      is_active: slide.is_active,
      display_order: slide.display_order
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this slide?')) return;

    try {
      const { error } = await supabase
        .from('hero_slides')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast({ title: 'Success', description: 'Slide deleted successfully' });
      fetchSlides();
    } catch (error) {
      console.error('Error deleting slide:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete slide',
        variant: 'destructive'
      });
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('hero_slides')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;
      fetchSlides();
    } catch (error) {
      console.error('Error toggling slide:', error);
      toast({
        title: 'Error',
        description: 'Failed to update slide status',
        variant: 'destructive'
      });
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      title: '',
      description: '',
      image_url: '',
      webp_url: '',
      alt_text: '',
      link_url: '',
      link_text: '',
      link_target: '_self',
      cta_position: 'bottom-center',
      cta_size: 'default',
      is_active: true,
      display_order: 0
    });
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Hero Slides Manager</h1>
          <p className="text-muted-foreground">Manage homepage hero carousel images</p>
        </div>
        <Button onClick={() => navigate('/admin')}>Back to Dashboard</Button>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>{editingId ? 'Edit Slide' : 'Add New Slide'}</CardTitle>
          <CardDescription>Upload and configure hero carousel slides</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="display_order">Display Order</Label>
                <Input
                  id="display_order"
                  type="number"
                  value={formData.display_order}
                  onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="image">Hero Image *</Label>
              <div className="flex gap-2">
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploading}
                />
                {uploading && <Loader2 className="h-5 w-5 animate-spin" />}
              </div>
              {formData.image_url && (
                <div className="mt-2 border rounded-lg p-2">
                  <img src={formData.image_url} alt="Preview" className="max-h-32 rounded" />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="alt_text">Alt Text</Label>
              <Input
                id="alt_text"
                value={formData.alt_text}
                onChange={(e) => setFormData({ ...formData, alt_text: e.target.value })}
                placeholder="Describe the image for accessibility"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="link_url">Link URL</Label>
                <Input
                  id="link_url"
                  value={formData.link_url}
                  onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                  placeholder="/products or https://..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="link_text">Button Text</Label>
                <Input
                  id="link_text"
                  value={formData.link_text}
                  onChange={(e) => setFormData({ ...formData, link_text: e.target.value })}
                  placeholder="Shop Now"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="link_target">Link Target</Label>
                <Select value={formData.link_target} onValueChange={(value) => setFormData({ ...formData, link_target: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_self">Same Tab</SelectItem>
                    <SelectItem value="_blank">New Tab</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cta_position">Button Position</Label>
                <Select value={formData.cta_position} onValueChange={(value) => setFormData({ ...formData, cta_position: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bottom-left">Bottom Left</SelectItem>
                    <SelectItem value="bottom-center">Bottom Center</SelectItem>
                    <SelectItem value="bottom-right">Bottom Right</SelectItem>
                    <SelectItem value="center">Center</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cta_size">Button Size</Label>
                <Select value={formData.cta_size} onValueChange={(value) => setFormData({ ...formData, cta_size: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sm">Small</SelectItem>
                    <SelectItem value="default">Default</SelectItem>
                    <SelectItem value="lg">Large</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label htmlFor="is_active">Active</Label>
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={uploading}>
                {editingId ? 'Update Slide' : 'Create Slide'}
              </Button>
              {editingId && (
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Slides List */}
      <Card>
        <CardHeader>
          <CardTitle>Current Slides</CardTitle>
          <CardDescription>Manage existing hero slides</CardDescription>
        </CardHeader>
        <CardContent>
          {slides.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No slides yet. Create your first one above.</p>
          ) : (
            <div className="space-y-4">
              {slides.map((slide) => (
                <div key={slide.id} className="flex gap-4 p-4 border rounded-lg">
                  <img src={slide.image_url} alt={slide.alt_text || slide.title} className="w-32 h-20 object-cover rounded" />
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold">{slide.title}</h3>
                        <p className="text-sm text-muted-foreground">{slide.description}</p>
                        <div className="flex gap-2 mt-2 text-xs text-muted-foreground">
                          <span>Order: {slide.display_order}</span>
                          {slide.link_url && <span>• Link: {slide.link_url}</span>}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => toggleActive(slide.id, slide.is_active)}
                        >
                          {slide.is_active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleEdit(slide)}>
                          Edit
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleDelete(slide.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}