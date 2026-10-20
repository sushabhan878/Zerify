import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { WalletService } from './wallet.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AddMoneyDto } from './dto/add-money.dto';

@ApiTags('wallet')
@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get authenticated brand\u2019s Zerify wallet and balance' })
  async getWallet(@Req() req: any) {
    return this.walletService.getOrCreateWallet(req.user.id);
  }

  @Post('add-money')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Initiate Add Money order via Cashfree payment gateway' })
  async addMoney(@Req() req: any, @Body() dto: AddMoneyDto) {
    return this.walletService.addMoney(req.user.id, dto);
  }

  @Post('add-money/:paymentId/verify')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Verify Cashfree Add Money payment and credit wallet' })
  async verifyAddMoney(@Req() req: any, @Param('paymentId') paymentId: string) {
    return this.walletService.verifyAddMoneyPayment(req.user.id, paymentId);
  }

  @Get('transactions')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List wallet transactions for authenticated brand' })
  async getTransactions(@Req() req: any) {
    const wallet = await this.walletService.getOrCreateWallet(req.user.id);
    return wallet.transactions;
  }

  @Post('saved-upi')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Save a UPI ID to brand profile for quick future payments' })
  async saveUpiId(@Req() req: any, @Body('upiId') upiId: string) {
    return this.walletService.saveUpiId(req.user.id, upiId);
  }

  @Post('saved-upi/delete')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove a saved UPI ID from brand profile' })
  async deleteUpiId(@Req() req: any, @Body('upiId') upiId: string) {
    return this.walletService.deleteUpiId(req.user.id, upiId);
  }
}
