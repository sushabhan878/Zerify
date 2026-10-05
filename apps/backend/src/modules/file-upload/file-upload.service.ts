import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class FileUploadService {
  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  async generateUploadSignature(folder: string = 'zerify_assets') {
    const timestamp = Math.round(new Date().getTime() / 1000);
    const signature = cloudinary.utils.api_sign_request(
      { timestamp, folder },
      process.env.CLOUDINARY_API_SECRET || '',
    );
    return { timestamp, signature, folder, cloudName: process.env.CLOUDINARY_CLOUD_NAME };
  }

  /**
   * Signature for a browser-direct upload of an arbitrary file (documents,
   * video, audio — not just images).
   *
   * `type: 'authenticated'` keeps the asset private: it cannot be fetched from
   * Cloudinary without a signed URL, which is what makes chat attachments safe
   * to store there. `resource_type: 'auto'` lets Cloudinary classify the file.
   */
  async generateSignedUploadParams(params: {
    folder: string;
    publicId: string;
    resourceType?: 'auto' | 'image' | 'video' | 'raw';
  }) {
    const timestamp = Math.round(Date.now() / 1000);
    const resourceType = params.resourceType || 'auto';

    // Only the params Cloudinary signs may be included, and they must match
    // exactly what the client posts — otherwise the upload is rejected.
    const signedParams: Record<string, string | number> = {
      folder: params.folder,
      public_id: params.publicId,
      timestamp,
      type: 'authenticated',
    };

    const signature = cloudinary.utils.api_sign_request(
      signedParams,
      process.env.CLOUDINARY_API_SECRET || '',
    );

    return {
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
      uploadUrl: `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`,
      resourceType,
      params: { ...signedParams, signature },
    };
  }

  /**
   * Short-lived signed URL for a private (`type: authenticated`) asset.
   * Never cache or log the result — it grants read access until it expires.
   */
  generateSignedDownloadUrl(params: {
    publicId: string;
    resourceType?: string;
    /** File extension, e.g. "pdf". Required by Cloudinary for raw assets. */
    format?: string;
    expiresInSeconds?: number;
    /** true → forces a browser download rather than inline rendering. */
    attachment?: boolean;
  }): string {
    const expiresAt = Math.round(Date.now() / 1000) + (params.expiresInSeconds ?? 300);

    // `utils.url({ sign_url: true })` produces a signature that never expires,
    // so we use the download endpoint, which honours `expires_at`.
    return cloudinary.utils.private_download_url(params.publicId, params.format || '', {
      resource_type: (params.resourceType as any) || 'image',
      type: 'authenticated',
      expires_at: expiresAt,
      attachment: params.attachment ?? false,
    });
  }

  async uploadImageBuffer(
    file: { buffer: Buffer; mimetype?: string; originalname?: string },
    folder: string = 'zerify_avatars',
  ): Promise<{ url: string; publicId?: string }> {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (cloudName && apiKey && apiSecret) {
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder, resource_type: 'image' },
          (error, result) => {
            if (error) {
              // On error fallback to base64 data URI
              const mime = file.mimetype || 'image/png';
              const base64 = file.buffer.toString('base64');
              return resolve({ url: `data:${mime};base64,${base64}` });
            }
            if (result) {
              return resolve({ url: result.secure_url, publicId: result.public_id });
            }
            const mime = file.mimetype || 'image/png';
            const base64 = file.buffer.toString('base64');
            return resolve({ url: `data:${mime};base64,${base64}` });
          },
        );
        uploadStream.end(file.buffer);
      });
    }

    // Fallback if no Cloudinary keys set locally
    const mime = file.mimetype || 'image/png';
    const base64 = file.buffer.toString('base64');
    return { url: `data:${mime};base64,${base64}` };
  }

  async deleteFile(publicId: string) {
    return cloudinary.uploader.destroy(publicId);
  }
}
