import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface ImageUploadDropzoneProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
}

export const ImageUploadDropzone: React.FC<ImageUploadDropzoneProps> = ({
  images,
  onImagesChange,
  maxImages = 10
}) => {
  const [uploading, setUploading] = useState(false);

  const uploadImageToSupabase = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    const filePath = `products/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw new Error(`Failed to upload image: ${uploadError.message}`);
    }

    const { data: { publicUrl } } = supabase.storage
      .from('product-images')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (images.length + acceptedFiles.length > maxImages) {
      toast({
        title: "Too many images",
        description: `Maximum ${maxImages} images allowed`,
        variant: "destructive"
      });
      return;
    }

    setUploading(true);
    
    try {
      const uploadPromises = acceptedFiles.map(uploadImageToSupabase);
      const uploadedUrls = await Promise.all(uploadPromises);
      onImagesChange([...images, ...uploadedUrls]);
      
      toast({
        title: "Images uploaded",
        description: `${uploadedUrls.length} image(s) uploaded successfully`
      });
    } catch (error) {
      console.error('Error uploading images:', error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload images",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  }, [images, onImagesChange, maxImages]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.gif']
    },
    disabled: uploading || images.length >= maxImages
  });

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
  };

  const moveImage = (fromIndex: number, toIndex: number) => {
    const newImages = [...images];
    const [movedImage] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, movedImage);
    onImagesChange(newImages);
  };

  return (
    <div className="space-y-4">
      {/* Upload Dropzone */}
      <Card 
        {...getRootProps()} 
        className={`border-2 border-dashed transition-colors cursor-pointer ${
          isDragActive 
            ? 'border-primary bg-primary/10' 
            : 'border-muted-foreground/25 hover:border-primary/50'
        } ${uploading || images.length >= maxImages ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <div className="p-8 text-center">
          <input {...getInputProps()} />
          <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          
          {uploading ? (
            <p className="text-sm text-muted-foreground">Uploading images...</p>
          ) : isDragActive ? (
            <p className="text-sm text-primary">Drop the images here...</p>
          ) : (
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                Drag & drop product images here, or click to select
              </p>
              <p className="text-xs text-muted-foreground">
                Supports JPEG, PNG, WebP, GIF. Max {maxImages} images ({images.length}/{maxImages})
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((imageUrl, index) => (
            <Card key={index} className="relative group overflow-hidden">
              <div className="aspect-square relative">
                <img
                  src={imageUrl}
                  alt={`Product image ${index + 1}`}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/placeholder.svg';
                  }}
                />
                
                {/* Remove button */}
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeImage(index);
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>

                {/* Primary image indicator */}
                {index === 0 && (
                  <div className="absolute bottom-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                    Primary
                  </div>
                )}

                {/* Order indicator */}
                <div className="absolute bottom-2 right-2 bg-background/80 text-foreground text-xs px-2 py-1 rounded">
                  {index + 1}
                </div>
              </div>

              {/* Move buttons */}
              <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                {index > 0 && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      moveImage(index, index - 1);
                    }}
                  >
                    ←
                  </Button>
                )}
                {index < images.length - 1 && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      moveImage(index, index + 1);
                    }}
                  >
                    →
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Empty state for images */}
      {images.length === 0 && (
        <Card className="p-8 text-center border-dashed">
          <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-sm text-muted-foreground">
            No images uploaded yet. Add some product images to get started.
          </p>
        </Card>
      )}
    </div>
  );
};