import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { IsEmail, IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { VipAccessService } from './vip-access.service';

export class CreateVipAccessDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @IsString()
  @IsOptional()
  type?: string;
}

@Controller('vip-access')
export class VipAccessController {
  constructor(private readonly vipAccessService: VipAccessService) {}

  @Post()
  @HttpCode(HttpStatus.OK) // Return 200 OK for standard client requests
  async create(@Body() createDto: CreateVipAccessDto) {
    return this.vipAccessService.create(createDto.email, createDto.type || 'BRAND');
  }
}
