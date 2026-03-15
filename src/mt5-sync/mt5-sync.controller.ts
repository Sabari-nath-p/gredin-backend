import { Controller, Post, Body, Param, UseGuards, Request, Delete } from '@nestjs/common';
import { Mt5SyncService } from './mt5-sync.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { LinkMt5Dto } from './dto/link-mt5.dto';

@UseGuards(JwtAuthGuard)
@Controller('mt5')
export class Mt5SyncController {
  constructor(private readonly mt5SyncService: Mt5SyncService) {}

  @Post('link/:accountId')
  async linkAccount(
    @Request() req,
    @Param('accountId') accountId: string,
    @Body() dto: LinkMt5Dto,
  ) {
    await this.mt5SyncService.linkAccount(req.user.userId, accountId, dto);
    return { message: 'MT5 account linked successfully' };
  }

  @Delete('link/:accountId')
  async unlinkAccount(
    @Request() req,
    @Param('accountId') accountId: string,
  ) {
    await this.mt5SyncService.unlinkAccount(req.user.userId, accountId);
    return { message: 'MT5 account unlinked successfully' };
  }

  @Post('sync/:accountId')
  async syncAccount(
    @Request() req,
    @Param('accountId') accountId: string,
  ) {
    return this.mt5SyncService.syncAccount(req.user.userId, accountId);
  }
}

