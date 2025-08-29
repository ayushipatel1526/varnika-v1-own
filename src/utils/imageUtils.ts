import { supabase } from '@/integrations/supabase/client';

export const uploadImageToStorage = async (
  file: Blob,
  fileName: string
): Promise<string> => {
  try {
    // Generate unique filename
    const fileExtension = fileName.split('.').pop() || 'jpg';
    const uniqueFileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExtension}`;
    
    const { data, error } = await supabase.storage
      .from('product-images')
      .upload(uniqueFileName, file, {
        contentType: file.type || 'image/jpeg',
        upsert: false
      });

    if (error) {
      throw error;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('product-images')
      .getPublicUrl(data.path);

    return urlData.publicUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw new Error('Failed to upload image');
  }
};

export const deleteImageFromStorage = async (imageUrl: string): Promise<void> => {
  try {
    // Extract file path from URL
    const urlParts = imageUrl.split('/');
    const fileName = urlParts[urlParts.length - 1];
    
    const { error } = await supabase.storage
      .from('product-images')
      .remove([fileName]);

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Error deleting image:', error);
    // Don't throw error for deletion failures as it shouldn't block other operations
  }
};

export const validateImageFile = (file: File): { isValid: boolean; error?: string } => {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const maxSize = 10 * 1024 * 1024; // 10MB

  if (!validTypes.includes(file.type)) {
    return {
      isValid: false,
      error: 'Please select a valid image file (JPEG, PNG, or WebP)'
    };
  }

  if (file.size > maxSize) {
    return {
      isValid: false,
      error: 'Image size must be less than 10MB'
    };
  }

  return { isValid: true };
};

export const createImagePreview = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      resolve(e.target?.result as string);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};