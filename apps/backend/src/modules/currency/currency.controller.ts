import { Controller, Get, Post, Patch, Body, Query, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import * as jwt from 'jsonwebtoken';
import { CurrencyService } from './currency.service';
import { ConvertCurrencyDto } from './dto/convert-currency.dto';
import { UpdateCurrencyPreferenceDto } from './dto/update-currency.dto';

@ApiTags('currency')
@Controller()
export class CurrencyController {
  constructor(private readonly currencyService: CurrencyService) {}

  private extractUserId(req: any): string | undefined {
    if (req.user?.id) return req.user.id;
    if (req.user?.sub) return req.user.sub;

    const authHeader = req.headers?.authorization || req.headers?.Authorization;
    if (authHeader && typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.split(' ')[1];
        const secret = process.env.JWT_SECRET || 'zerify-dev-secret-key-super-secure';
        const decoded: any = jwt.verify(token, secret);
        return decoded?.sub || decoded?.id;
      } catch (e) {
        // Token decode failed
      }
    }
    return undefined;
  }

  @Get('currencies')
  @ApiOperation({ summary: 'Get list of active supported currencies (PRD §23)' })
  @ApiResponse({ status: 200, description: 'Active currency list retrieved successfully.' })
  async getCurrencies() {
    return this.currencyService.getCurrencies();
  }

  @Get('currencies/rates')
  @ApiOperation({ summary: 'Get latest exchange rates for base currency' })
  @ApiResponse({ status: 200, description: 'Exchange rates retrieved successfully.' })
  async getRates(@Query('base') base?: string) {
    return this.currencyService.getRates(base || 'USD');
  }

  @Post('currency/convert')
  @ApiOperation({ summary: 'Convert amount between currencies (PRD §25)' })
  @ApiResponse({ status: 200, description: 'Currency converted successfully.' })
  async convert(@Body() dto: ConvertCurrencyDto) {
    return this.currencyService.convert(dto.amount, dto.from, dto.to);
  }

  @Get('me/preferences/currency')
  @ApiOperation({ summary: 'Get user currency preference (PRD §24)' })
  @ApiResponse({ status: 200, description: 'User currency preference retrieved.' })
  async getUserCurrency(@Req() req: any) {
    const userId = this.extractUserId(req);
    return this.currencyService.getUserCurrencyPreference(userId || '');
  }

  @Patch('me/preferences/currency')
  @ApiOperation({ summary: 'Update user currency preference (PRD §24)' })
  @ApiResponse({ status: 200, description: 'User currency preference updated.' })
  async updateUserCurrency(@Req() req: any, @Body() dto: UpdateCurrencyPreferenceDto) {
    const userId = this.extractUserId(req);
    return this.currencyService.updateUserCurrencyPreference(userId || '', dto.currency);
  }
}
