import { Test, TestingModule } from '@nestjs/testing';
import { FileUploadService } from './file-upload.service';

describe('FileUploadService', () => {
  let service: FileUploadService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FileUploadService],
    }).compile();

    service = module.get<FileUploadService>(FileUploadService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return base64 fallback URL when Cloudinary keys are unconfigured', async () => {
    const mockFile = {
      buffer: Buffer.from('test-image-data'),
      mimetype: 'image/png',
      originalname: 'test.png',
    };

    const result = await service.uploadImageBuffer(mockFile);
    expect(result).toBeDefined();
    expect(result.url).toContain('data:image/png;base64,');
  });

  it('should generate upload signature', async () => {
    const sig = await service.generateUploadSignature('zerify_test');
    expect(sig).toBeDefined();
    expect(sig.folder).toBe('zerify_test');
    expect(sig.timestamp).toBeGreaterThan(0);
  });
});
