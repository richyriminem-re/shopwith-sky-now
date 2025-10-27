import { useState } from "react";
import { Upload, X, GripVertical, Link as LinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ImageData {
  url: string;
  alt_text?: string;
  sort_order: number;
}

interface ImageUploaderProps {
  images: ImageData[];
  onChange: (images: ImageData[]) => void;
}

export function ImageUploader({ images, onChange }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [addingUrl, setAddingUrl] = useState(false);
  const { toast } = useToast();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const maxFiles = 10;
    if (images.length + files.length > maxFiles) {
      toast({
        title: "Too many images",
        description: `Maximum ${maxFiles} images allowed`,
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        // Validate file type
        if (!file.type.startsWith("image/")) {
          throw new Error(`${file.name} is not an image`);
        }

        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
          throw new Error(`${file.name} is too large (max 5MB)`);
        }

        // Upload to Supabase Storage
        const fileExt = file.name.split(".").pop();
        const fileName = `${crypto.randomUUID()}.${fileExt}`;
        const { data, error } = await supabase.storage
          .from("product-images")
          .upload(fileName, file);

        if (error) throw error;

        // Get public URL
        const {
          data: { publicUrl },
        } = supabase.storage.from("product-images").getPublicUrl(data.path);

        return publicUrl;
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      const newImages: ImageData[] = uploadedUrls.map((url, index) => ({
        url,
        alt_text: "",
        sort_order: images.length + index,
      }));

      onChange([...images, ...newImages]);

      toast({
        title: "Success",
        description: `Uploaded ${uploadedUrls.length} image(s)`,
      });
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      e.target.value = ""; // Reset input
    }
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    // Re-index sort order
    const reindexed = newImages.map((img, i) => ({ ...img, sort_order: i }));
    onChange(reindexed);
  };

  const updateAltText = (index: number, alt_text: string) => {
    const newImages = [...images];
    newImages[index] = { ...newImages[index], alt_text };
    onChange(newImages);
  };

  const moveImage = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= images.length) return;
    
    const newImages = [...images];
    const [moved] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, moved);
    
    // Re-index sort order
    const reindexed = newImages.map((img, i) => ({ ...img, sort_order: i }));
    onChange(reindexed);
  };

  const handleAddFromUrl = async () => {
    if (!imageUrl.trim()) {
      toast({
        title: "URL required",
        description: "Please enter an image URL",
        variant: "destructive",
      });
      return;
    }

    const maxFiles = 10;
    if (images.length >= maxFiles) {
      toast({
        title: "Too many images",
        description: `Maximum ${maxFiles} images allowed`,
        variant: "destructive",
      });
      return;
    }

    setAddingUrl(true);

    try {
      // Validate if URL is accessible
      const response = await fetch(imageUrl, { method: 'HEAD' });
      if (!response.ok) {
        throw new Error("Unable to access image URL");
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.startsWith('image/')) {
        throw new Error("URL does not point to an image");
      }

      const newImage: ImageData = {
        url: imageUrl,
        alt_text: "",
        sort_order: images.length,
      };

      onChange([...images, newImage]);
      setImageUrl("");

      toast({
        title: "Success",
        description: "Image added from URL",
      });
    } catch (error: any) {
      toast({
        title: "Failed to add image",
        description: error.message || "Invalid image URL",
        variant: "destructive",
      });
    } finally {
      setAddingUrl(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>Product Images *</Label>
        <p className="text-xs text-muted-foreground mb-2">
          At least 1 image required (max 10). First image is the main image.
        </p>
      </div>

      {/* Upload Options */}
      <Tabs defaultValue="file" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="file">
            <Upload className="h-4 w-4 mr-2" />
            Upload File
          </TabsTrigger>
          <TabsTrigger value="url">
            <LinkIcon className="h-4 w-4 mr-2" />
            From URL
          </TabsTrigger>
        </TabsList>

        <TabsContent value="file" className="mt-4">
          <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
            <Input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              disabled={uploading || images.length >= 10}
              className="hidden"
              id="image-upload"
            />
            <label htmlFor="image-upload" className="cursor-pointer">
              <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
              <p className="text-sm font-medium">
                {uploading ? "Uploading..." : "Click to upload images"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                JPG, PNG, WEBP up to 5MB each
              </p>
            </label>
          </div>
        </TabsContent>

        <TabsContent value="url" className="mt-4">
          <div className="border-2 border-dashed rounded-lg p-6">
            <div className="space-y-3">
              <div>
                <Label htmlFor="image-url">Image URL</Label>
                <Input
                  id="image-url"
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  disabled={addingUrl || images.length >= 10}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddFromUrl();
                    }
                  }}
                />
              </div>
              <Button
                type="button"
                onClick={handleAddFromUrl}
                disabled={addingUrl || !imageUrl.trim() || images.length >= 10}
                className="w-full"
              >
                {addingUrl ? "Adding..." : "Add Image from URL"}
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                Enter a direct link to an image (JPG, PNG, WEBP, etc.)
              </p>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div className="space-y-3">
          {images.map((image, index) => (
            <div
              key={index}
              className="flex gap-3 p-3 border rounded-lg bg-card"
            >
              <div className="flex flex-col gap-1 items-center">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 cursor-move"
                  onClick={() => moveImage(index, index - 1)}
                  disabled={index === 0}
                >
                  <GripVertical className="h-4 w-4" />
                </Button>
                <span className="text-xs text-muted-foreground">
                  {index + 1}
                </span>
              </div>

              <img
                src={image.url}
                alt={image.alt_text || `Product image ${index + 1}`}
                className="w-20 h-20 object-cover rounded"
              />

              <div className="flex-1 min-w-0">
                <Input
                  placeholder="Alt text (optional)"
                  value={image.alt_text || ""}
                  onChange={(e) => updateAltText(index, e.target.value)}
                  className="text-sm"
                />
                {index === 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Main image
                  </p>
                )}
              </div>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeImage(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {images.length === 0 && (
        <p className="text-sm text-destructive">At least one image is required</p>
      )}
    </div>
  );
}
