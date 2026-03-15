import { Module } from '@nestjs/common';
import { Mt5SyncService } from './mt5-sync.service';
import { Mt5SyncController } from './mt5-sync.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [Mt5SyncService],
  controllers: [Mt5SyncController],
})
export class Mt5SyncModule {}
