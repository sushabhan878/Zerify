import { Test, TestingModule } from '@nestjs/testing';
import { VipAccessController } from '../../../../apps/backend/src/modules/vip-access/vip-access.controller';
import { VipAccessService } from '../../../../apps/backend/src/modules/vip-access/vip-access.service';

describe('VipAccessController', () => {
  let controller: VipAccessController;
  let service: VipAccessService;

  const mockVipAccessService = {
    create: jest.fn().mockImplementation((email: string, type: string) =>
      Promise.resolve({
        success: true,
        message: 'Successfully joined the VIP waitlist!',
        data: {
          id: 'test-uuid-123',
          email,
          type: type.toUpperCase(),
        },
      }),
    ),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VipAccessController],
      providers: [
        {
          provide: VipAccessService,
          useValue: mockVipAccessService,
        },
      ],
    }).compile();

    controller = module.get<VipAccessController>(VipAccessController);
    service = module.get<VipAccessService>(VipAccessService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should register a brand email on the VIP waitlist', async () => {
    const dto = { email: 'test@brand.com', type: 'BRAND' };
    const result = (await controller.create(dto)) as any;

    expect(service.create).toHaveBeenCalledWith('test@brand.com', 'BRAND');
    expect(result.success).toBe(true);
    expect(result.data.email).toBe('test@brand.com');
  });
});
