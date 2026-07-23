import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { VipAccessService } from './vip-access.service';

class CreateVipAccessDto {
  email: string;
  type: string;
}

@Controller('vip-access')
export class VipAccessController {
  constructor(private readonly vipAccessService: VipAccessService) {}

  @Post()
  @HttpCode(HttpStatus.OK) // Return 200 OK for standard client requests
  async create(@Body() createDto: CreateVipAccessDto) {
    return this.vipAccessService.create(createDto.email, createDto.type);
  }
}
