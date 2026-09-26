import { BadRequestException, Injectable, ServiceUnavailableException } from '@nestjs/common';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { randomUUID } from 'crypto';
import { PrismaService } from '../../database/prisma.service';
import { FileUploadService } from '../file-upload/file-upload.service';
import { DeliverableAccessService } from './deliverable-access.service';
import { detectMediaType, rulesOf } from './deliverable-rules';

@Injectable()
export class DeliverableAssetsService {
  constructor(private readonly prisma: PrismaService, private readonly access: DeliverableAccessService, private readonly files: FileUploadService) {}

  async upload(userId: string, id: string, file?: { buffer: Buffer; mimetype: string; originalname: string }) {
    const d = await this.access.get(userId, id, 'creator');
    this.access.assertActive(d.participant);
    if (!['PENDING', 'IN_PROGRESS', 'REVISION_REQUESTED'].includes(d.status)) throw new BadRequestException('This deliverable is not accepting uploads');
    const rules = rulesOf(d.requirements);
    if (!file?.buffer?.length) throw new BadRequestException('Select a non-empty file');
    const mime = detectMediaType(file.buffer);
    if (!mime || !rules.allowedMimeTypes.includes(mime)) throw new BadRequestException('Unsupported file content or MIME type');
    if (file.buffer.length > rules.maxFileSizeMb * 1024 * 1024) throw new BadRequestException(`File exceeds ${rules.maxFileSizeMb} MB`);
    if (!process.env.CLOUDINARY_API_SECRET || !process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY) {
      throw new ServiceUnavailableException('Private media storage is not configured. Please try again later.');
    }
    const publicId = `zerify_deliverables/${id}/${randomUUID()}`;
    let result: UploadApiResponse;
    try {
      result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream({ public_id: publicId, type: 'authenticated', resource_type: mime.startsWith('video/') ? 'video' : 'image', overwrite: false },
          (error, uploaded) => error || !uploaded ? reject(error) : resolve(uploaded));
        stream.end(file.buffer);
      });
    } catch { throw new ServiceUnavailableException('Upload failed. Your submission was not changed; retry the upload.'); }
    if (!result.bytes || !result.format) throw new BadRequestException('Storage could not process this media');
    const asset = await this.prisma.deliverableAsset.create({ data: {
      deliverableId: id, uploadedBy: userId, publicId: result.public_id,
      resourceType: result.resource_type, format: result.format, mimeType: mime,
      filename: file.originalname.slice(0, 255), size: result.bytes, duration: result.duration,
    } });
    return { id: asset.id, filename: asset.filename, size: asset.size, mimeType: asset.mimeType, duration: asset.duration };
  }

  async download(userId: string, id: string, assetId: string) {
    const d = await this.access.get(userId, id);
    const asset = await this.prisma.deliverableAsset.findFirst({ where: { id: assetId, deliverableId: id } });
    if (!asset) throw new BadRequestException('File not found');
    const isSubmitted = d.revisions.some(r => r.assetIds.includes(assetId));
    if (asset.uploadedBy !== userId && !isSubmitted) throw new BadRequestException('File has not been submitted');
    return { url: this.files.generateSignedDownloadUrl({ publicId: asset.publicId, resourceType: asset.resourceType, format: asset.format, expiresInSeconds: 300 }) };
  }
}
