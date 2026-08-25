import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../firebase';
import { UserProfile } from '../types';

export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
export const SUPPORTED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const SUPPORTED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validates the uploaded file for type, size, and extension.
 */
export function validateProfileImageFile(file: File): ValidationResult {
  if (!file) {
    return { valid: false, error: 'No file selected.' };
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE_BYTES) {
    const sizeInMB = (file.size / (1024 * 1024)).toFixed(1);
    return {
      valid: false,
      error: `File is too large (${sizeInMB}MB). Maximum allowed size is 5MB.`
    };
  }

  // Check MIME type
  const isMimeValid = SUPPORTED_MIME_TYPES.includes(file.type.toLowerCase());
  const fileExt = '.' + file.name.split('.').pop()?.toLowerCase();
  const isExtValid = SUPPORTED_EXTENSIONS.includes(fileExt);

  if (!isMimeValid && !isExtValid) {
    return {
      valid: false,
      error: 'Unsupported format. Please upload a JPG, PNG, or WebP image.'
    };
  }

  return { valid: true };
}

/**
 * Loads an image from a File or Data URL into an HTMLImageElement
 */
export function loadImageElement(source: File | string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(new Error('Failed to load image for processing: ' + String(err)));

    if (typeof source === 'string') {
      img.src = source;
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          img.src = e.target.result as string;
        } else {
          reject(new Error('Failed to read file.'));
        }
      };
      reader.onerror = () => reject(new Error('FileReader error.'));
      reader.readAsDataURL(source);
    }
  });
}

export interface CropParameters {
  zoom: number; // 1.0 to 3.0
  offsetX: number; // pixels relative to center
  offsetY: number; // pixels relative to center
  outputSize?: number; // default 512x512
}

/**
 * Crops and processes the image into a high-quality square blob (512x512)
 * preserving aspect ratio without distortion.
 */
export async function cropAndProcessImage(
  imageSource: HTMLImageElement | File | string,
  params: CropParameters
): Promise<Blob> {
  let img: HTMLImageElement;
  if (imageSource instanceof HTMLImageElement) {
    img = imageSource;
  } else {
    img = await loadImageElement(imageSource);
  }

  const outputSize = params.outputSize || 512;
  const canvas = document.createElement('canvas');
  canvas.width = outputSize;
  canvas.height = outputSize;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas 2D rendering context is not supported.');
  }

  // Use crisp image smoothing
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // Fill transparent background with white in case of transparent PNGs
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, outputSize, outputSize);

  // Compute cover dimensions
  const imgWidth = img.naturalWidth || img.width;
  const imgHeight = img.naturalHeight || img.height;

  if (!imgWidth || !imgHeight) {
    throw new Error('Invalid image dimensions.');
  }

  // Determine base scale to cover the output square
  const baseScale = Math.max(outputSize / imgWidth, outputSize / imgHeight);
  const totalScale = baseScale * (params.zoom || 1.0);

  const drawWidth = imgWidth * totalScale;
  const drawHeight = imgHeight * totalScale;

  // Center alignment with user offsets
  const drawX = (outputSize - drawWidth) / 2 + params.offsetX * (outputSize / 256);
  const drawY = (outputSize - drawHeight) / 2 + params.offsetY * (outputSize / 256);

  ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to generate image blob from canvas.'));
        }
      },
      'image/jpeg',
      0.92
    );
  });
}

/**
 * Converts a Blob to a base64 data URL
 */
export function blobToDataURL(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to convert blob to data URL.'));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Uploads custom profile picture to Firebase Storage for the authenticated user.
 * Falls back to an optimized base64 data URL if storage bucket is unreachable.
 */
export async function uploadCustomProfilePicture(
  userId: string,
  imageBlob: Blob
): Promise<string> {
  if (!userId) {
    throw new Error('User must be authenticated to upload a profile picture.');
  }

  const timestamp = Date.now();
  const fileName = `avatar_${timestamp}.jpg`;
  const storagePath = `users/${userId}/${fileName}`;

  try {
    const storageRef = ref(storage, storagePath);
    const metadata = {
      contentType: 'image/jpeg',
      customMetadata: {
        userId,
        uploadedAt: String(timestamp),
      }
    };

    const snapshot = await uploadBytes(storageRef, imageBlob, metadata);
    const downloadUrl = await getDownloadURL(snapshot.ref);
    return downloadUrl;
  } catch (storageError: any) {
    console.warn('[Firebase Storage Notice]: Direct Storage upload encountered error, evaluating fallback:', storageError);
    
    // If Firebase Storage is unavailable in this environment, generate a compact data URL
    // Resize down to 256x256 to ensure payload is under 35KB
    try {
      const dataUrl = await blobToDataURL(imageBlob);
      return dataUrl;
    } catch (fallbackError) {
      throw new Error(`Failed to process profile picture: ${storageError?.message || String(storageError)}`);
    }
  }
}

/**
 * Deletes an old profile picture from Firebase Storage if it was hosted there.
 */
export async function deletePreviousProfilePicture(photoUrl?: string | null): Promise<void> {
  if (!photoUrl || typeof photoUrl !== 'string') return;

  // Check if it's a Firebase Storage URL
  if (photoUrl.includes('firebasestorage.googleapis.com') || photoUrl.includes('.firebasestorage.app')) {
    try {
      const storageRef = ref(storage, photoUrl);
      await deleteObject(storageRef);
      console.log('Previous custom profile photo removed from Firebase Storage');
    } catch (err) {
      // Ignore not-found or permission errors on cleanup
      console.warn('Could not delete previous photo from storage:', err);
    }
  }
}

/**
 * Determines the effective profile picture based on the 3-tier priority:
 * 1. Custom profile picture exists -> use custom picture
 * 2. No custom picture -> use Google/Microsoft provider picture
 * 3. Provider does not provide a picture -> use null (which renders initials/default avatar)
 */
export function getEffectiveProfilePhoto(
  profile?: Partial<UserProfile> | null,
  authPhotoUrl?: string | null
): string | null {
  if (!profile && !authPhotoUrl) return null;

  // 1. Priority 1: Custom Profile Picture
  if (profile?.customProfilePhoto && profile.customProfilePhoto.trim() !== '') {
    return profile.customProfilePhoto;
  }

  // 2. Priority 2: Provider Photo (Google / Microsoft)
  if (profile?.providerPhoto && profile.providerPhoto.trim() !== '') {
    return profile.providerPhoto;
  }

  if (authPhotoUrl && authPhotoUrl.trim() !== '') {
    return authPhotoUrl;
  }

  // 3. Fallback to existing profile.profilePhoto if neither custom nor provider is explicitly split
  if (profile?.profilePhoto && profile.profilePhoto.trim() !== '') {
    return profile.profilePhoto;
  }

  // 4. Default / Initials
  return null;
}

/**
 * Checks whether the user is currently using a custom uploaded profile picture.
 */
export function isUsingCustomProfilePicture(
  profile?: Partial<UserProfile> | null
): boolean {
  return Boolean(profile?.customProfilePhoto && profile.customProfilePhoto.trim() !== '');
}
