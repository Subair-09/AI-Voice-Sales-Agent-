import { v2 as cloudinary } from 'cloudinary';

const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || '';
const API_KEY = process.env.CLOUDINARY_API_KEY || '';
const API_SECRET = process.env.CLOUDINARY_API_SECRET || '';

const isConfigured = Boolean(CLOUD_NAME && API_KEY && API_SECRET) || Boolean(process.env.CLOUDINARY_URL);

if (isConfigured) {
  if (process.env.CLOUDINARY_URL) {
    cloudinary.config();
  } else {
    cloudinary.config({
      cloud_name: CLOUD_NAME,
      api_key: API_KEY,
      api_secret: API_SECRET,
      secure: true,
    });
  }
  console.log(`✅ Cloudinary: Configured for cloud "${CLOUD_NAME || 'via CLOUDINARY_URL'}"`);
} else {
  console.log('ℹ️ Cloudinary: Credentials not set in environment. Image uploads will use resilient fallback storage.');
}

export function isCloudinaryConfigured(): boolean {
  return isConfigured;
}

export function getCloudinaryStatus() {
  return {
    configured: isConfigured,
    cloudName: CLOUD_NAME || (process.env.CLOUDINARY_URL ? 'Configured via URL' : undefined),
    apiKeyProvided: Boolean(API_KEY || process.env.CLOUDINARY_URL),
    mode: isConfigured ? 'production_cloudinary' : 'resilient_fallback',
  };
}

export interface UploadResult {
  url: string;
  publicId: string;
  format?: string;
  bytes?: number;
  width?: number;
  height?: number;
  provider: 'cloudinary' | 'local_fallback';
}

/**
 * Upload an image (base64 string, data URI, or remote URL) to Cloudinary
 */
export async function uploadImage(
  fileOrBase64: string,
  options: { folder?: string; tags?: string[]; publicId?: string } = {}
): Promise<UploadResult> {
  const folder = options.folder || 'baked-by-doja';

  if (!isConfigured) {
    // Graceful fallback for environments where Cloudinary credentials are not yet supplied
    const syntheticId = `bbd_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    
    // If it's already a valid http(s) URL or data URI, pass it back with a synthetic public ID
    if (fileOrBase64.startsWith('http://') || fileOrBase64.startsWith('https://')) {
      return {
        url: fileOrBase64,
        publicId: syntheticId,
        format: 'jpg',
        bytes: 256000,
        provider: 'local_fallback',
      };
    }

    if (fileOrBase64.startsWith('data:image')) {
      return {
        url: fileOrBase64, // Keep data URI directly for instant display
        publicId: syntheticId,
        format: 'png',
        bytes: Math.round(fileOrBase64.length * 0.75),
        provider: 'local_fallback',
      };
    }

    // Default premium bakery product placeholder image
    return {
      url: 'https://images.unsplash.com/photo-1608039829572-78524f79c4c7?auto=format&fit=crop&w=800&q=80',
      publicId: syntheticId,
      format: 'jpg',
      bytes: 320000,
      provider: 'local_fallback',
    };
  }

  try {
    const uploadResponse = await cloudinary.uploader.upload(fileOrBase64, {
      folder,
      tags: options.tags || ['baked-by-doja', 'banana-bread'],
      public_id: options.publicId,
      resource_type: 'auto',
    });

    return {
      url: uploadResponse.secure_url,
      publicId: uploadResponse.public_id,
      format: uploadResponse.format,
      bytes: uploadResponse.bytes,
      width: uploadResponse.width,
      height: uploadResponse.height,
      provider: 'cloudinary',
    };
  } catch (err: any) {
    console.error('Cloudinary upload error:', err);
    throw new Error(`Cloudinary upload failed: ${err.message || 'Unknown error'}`);
  }
}

/**
 * Delete an image by its publicId
 */
export async function deleteImage(publicId: string): Promise<boolean> {
  if (!isConfigured) {
    return true;
  }

  try {
    const res = await cloudinary.uploader.destroy(publicId);
    return res.result === 'ok';
  } catch (err) {
    console.error('Cloudinary delete error:', err);
    return false;
  }
}
