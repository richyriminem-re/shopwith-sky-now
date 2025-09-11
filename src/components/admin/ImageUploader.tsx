import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, Upload, Link } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ImageUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  images,
  onChange
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [urlInput, setUrlInput] = React.useState('');

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    // In a real app, you would upload to Supabase storage
    // For now, we'll create temporary URLs (mock implementation)
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          onChange([...images, e.target.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const addImageUrl = () => {
    if (urlInput.trim() && !images.includes(urlInput.trim())) {
      onChange([...images, urlInput.trim()]);
      setUrlInput('');
    }
  };

  const removeImage = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
  };

  const moveImage = (fromIndex: number, toIndex: number) => {
    const newImages = [...images];
    const [moved] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, moved);
    onChange(newImages);
  };

  return (
    <div className="space-y-4">
      {/* Image Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <Card key={index} className="relative group">
              <CardContent className="p-2">
                <div className="aspect-square relative overflow-hidden rounded-md">
                  <img
                    src={image}
                    alt={`Product image ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      onClick={() => removeImage(index)}
                      className="p-2"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                  {index === 0 && (
                    <Badge className="absolute top-1 left-1 text-xs">
                      Primary
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Upload Methods */}
      <div className="space-y-4">
        {/* File Upload */}
        <Card>
          <CardContent className="p-4">
            <div className="space-y-3">
              <Label>Upload Images</Label>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 tap-target-md"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Choose Files
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Supported formats: JPG, PNG, WebP. Max size: 5MB per image.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* URL Input */}
        <Card>
          <CardContent className="p-4">
            <div className="space-y-3">
              <Label htmlFor="image-url">Add Image URL</Label>
              <div className="flex gap-2">
                <Input
                  id="image-url"
                  placeholder="https://example.com/image.jpg"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addImageUrl()}
                />
                <Button
                  type="button"
                  onClick={addImageUrl}
                  disabled={!urlInput.trim()}
                  className="tap-target-md"
                >
                  <Link className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Instructions */}
      {images.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="p-8 text-center">
            <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No images added yet</h3>
            <p className="text-muted-foreground mb-4">
              Add product images by uploading files or providing URLs
            </p>
            <p className="text-xs text-muted-foreground">
              The first image will be used as the primary product image
            </p>
          </CardContent>
        </Card>
      )}

      {images.length > 0 && (
        <div className="text-sm text-muted-foreground">
          {images.length} image{images.length !== 1 ? 's' : ''} added.
          The first image will be used as the primary product image.
        </div>
      )}
    </div>
  );
};