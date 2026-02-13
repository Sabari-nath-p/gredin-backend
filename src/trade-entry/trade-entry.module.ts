import { Module } from '@nestjs/common';
import { TradeEntryService } from './trade-entry.service';
import { TradeEntryController } from './trade-entry.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [TradeEntryController],
    providers: [TradeEntryService],
    exports: [TradeEntryService],
})
export class TradeEntryModule { }
