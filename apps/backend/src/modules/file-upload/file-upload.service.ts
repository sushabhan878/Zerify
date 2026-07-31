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
