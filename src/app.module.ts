import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TradeAccountModule } from './trade-account/trade-account.module';
import { TradeEntryModule } from './trade-entry/trade-entry.module';
import { LogTemplateModule } from './log-template/log-template.module';
import { S3Module } from './s3/s3.module';
import { ChatModule } from './chat/chat.module';
import { Mt5SyncModule } from './mt5-sync/mt5-sync.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    TradeAccountModule,
    TradeEntryModule,
    LogTemplateModule,
    S3Module,
    ChatModule,
    Mt5SyncModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
