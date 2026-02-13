import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TradeAccountModule } from './trade-account/trade-account.module';
import { TradeEntryModule } from './trade-entry/trade-entry.module';

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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
