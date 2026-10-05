import { Module } from '@nestjs/common';
import { CurrencyController } from './currency.controller';
import { CurrencyService } from './currency.service';
import { OpenExchangeRatesProvider } from './fx/open-exchange-rates.provider';
import { FrankfurterProvider } from './fx/frankfurter.provider';

@Module({
  controllers: [CurrencyController],
  providers: [CurrencyService, OpenExchangeRatesProvider, FrankfurterProvider],
  exports: [CurrencyService],
})
export class CurrencyModule {}
