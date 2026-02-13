import { Module } from '@nestjs/common';
import { TradeAccountService } from './trade-account.service';
import { TradeAccountController } from './trade-account.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [TradeAccountController],
  providers: [TradeAccountService],
  exports: [TradeAccountService],
})
export class TradeAccountModule { }
