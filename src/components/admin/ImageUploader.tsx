import React from 'react';
import { ImageUploadDropzone } from './ImageUploadDropzone';

interface ImageUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  images,
  onChange
}) => {
  return (
    <ImageUploadDropzone
      images={images}
      onImagesChange={onChange}
      maxImages={10}
    />
  );
};