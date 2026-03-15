import { Controller, Post, Body, Param, UseGuards, Request, Delete } from '@nestjs/common';
import { Mt5SyncService } from './mt5-sync.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { LinkMt5Dto } from './dto/link-mt5.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';

@ApiTags('MT5 Integration')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
@Controller('mt5')
export class Mt5SyncController {
  constructor(private readonly mt5SyncService: Mt5SyncService) {}

  @Post('link/:accountId')
  @ApiOperation({ summary: 'Link an existing account to MT5' })
  @ApiParam({ name: 'accountId', description: 'Trade account ID' })
  @ApiResponse({ status: 201, description: 'MT5 account linked successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Trade account not found' })
  async linkAccount(
    @Request() req,
    @Param('accountId') accountId: string,
    @Body() dto: LinkMt5Dto,
  ) {
    await this.mt5SyncService.linkAccount(req.user.userId, accountId, dto);
    return { message: 'MT5 account linked successfully' };
  }

  @Delete('link/:accountId')
  @ApiOperation({ summary: 'Unlink an MT5 account' })
  @ApiParam({ name: 'accountId', description: 'Trade account ID' })
  @ApiResponse({ status: 200, description: 'MT5 account unlinked successfully' })
  async unlinkAccount(
    @Request() req,
    @Param('accountId') accountId: string,
  ) {
    await this.mt5SyncService.unlinkAccount(req.user.userId, accountId);
    return { message: 'MT5 account unlinked successfully' };
  }

  @Post('sync/:accountId')
  @ApiOperation({ summary: 'Force sync an MT5 account' })
  @ApiParam({ name: 'accountId', description: 'Trade account ID' })
  @ApiResponse({ status: 201, description: 'MT5 account synced successfully' })
  async syncAccount(
    @Request() req,
    @Param('accountId') accountId: string,
  ) {
    return this.mt5SyncService.syncAccount(req.user.userId, accountId);
  }
}

