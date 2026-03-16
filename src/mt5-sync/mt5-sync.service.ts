import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
  ServiceUnavailableException,
  GatewayTimeoutException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { LinkMt5Dto } from './dto/link-mt5.dto';
import { TradeDirection, TradeStatus, TradeResult } from '@prisma/client';

@Injectable()
export class Mt5SyncService {
  private readonly logger = new Logger(Mt5SyncService.name);
  
  // Basic symmetrical encryption
  private readonly algorithm = 'aes-256-cbc';
  private readonly fixedKey: Buffer;

  constructor(
    private prisma: PrismaService,
    private config: ConfigService
  ) {
    const rawKey = this.config.get<string>('JWT_SECRET') || 'default_secret_key_needs_32_bytes_at_least_abcdefg';
    // Ensure key is exactly 32 bytes for aes-256
    this.fixedKey = crypto.createHash('sha256').update(String(rawKey)).digest();
  }

  private encrypt(text: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(this.algorithm, this.fixedKey, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return `${iv.toString('hex')}:${encrypted}`;
  }

  private decrypt(text: string): string {
    const textParts = text.split(':');
    const iv = Buffer.from(textParts.shift()!, 'hex');
    const encryptedText = Buffer.from(textParts.join(':'), 'hex');
    const decipher = crypto.createDecipheriv(this.algorithm, this.fixedKey, iv);
    let decrypted = decipher.update(encryptedText, undefined, 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  private async readRunnerError(response: Response): Promise<string> {
    const payload = await response.json().catch(() => null);
    if (payload?.detail) {
      return String(payload.detail);
    }
    if (payload?.message) {
      return String(payload.message);
    }
    return response.statusText || 'Unknown MT5 runner error';
  }

  async linkAccount(userId: string, accountId: string, dto: LinkMt5Dto) {
    const account = await this.prisma.tradeAccount.findFirst({
      where: { id: accountId, userId }
    });

    if (!account) throw new NotFoundException('Trade account not found');

    const encryptedPassword = this.encrypt(dto.mt5Password);

    return this.prisma.tradeAccount.update({
      where: { id: accountId },
      data: {
        mt5Login: dto.mt5Login,
        mt5Password: encryptedPassword,
        mt5Server: dto.mt5Server
      }
    });
  }

  async unlinkAccount(userId: string, accountId: string) {
    return this.prisma.tradeAccount.update({
      where: { id: accountId },
      data: {
        mt5Login: null,
        mt5Password: null,
        mt5Server: null,
        lastSyncTime: null
      }
    });
  }

  async syncAccount(userId: string, accountId: string) {
    const account = await this.prisma.tradeAccount.findFirst({
      where: { id: accountId, userId }
    });

    if (!account) throw new NotFoundException('Account not found');
    if (!account.mt5Login || !account.mt5Password || !account.mt5Server) {
      throw new BadRequestException('MT5 credentials not linked to this account.');
    }

    const decryptedPassword = this.decrypt(account.mt5Password);
    
    // Default fetch for the last 30 days if no previous sync
    const startTimestamp = account.lastSyncTime 
      ? Math.floor(account.lastSyncTime.getTime() / 1000) - 86400 
      : Math.floor(Date.now() / 1000) - (30 * 86400); 
    const endTimestamp = Math.floor(Date.now() / 1000) + 86400; 

    // Call Python FastAPI MTrunner (normally hosted on a separate Windows VM/VPS in production)
    const pythonApiUrl =
      this.config.get<string>('MT5_RUNNER_URL') || 'http://host.docker.internal:8000/api/mt5/sync';
    const runnerApiKey = this.config.get<string>('MT5_RUNNER_API_KEY') || '';
    const timeoutMs = Number(this.config.get<string>('MT5_RUNNER_TIMEOUT_MS') || '30000');

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    let response;
    
    try {
      response = await fetch(pythonApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(runnerApiKey ? { 'x-api-key': runnerApiKey } : {}),
        },
        signal: controller.signal,
        body: JSON.stringify({
          login: parseInt(account.mt5Login, 10),
          password: decryptedPassword,
          server: account.mt5Server,
          start_timestamp: startTimestamp,
          end_timestamp: endTimestamp
        })
      });
    } catch (e) {
      if ((e as Error).name === 'AbortError') {
        this.logger.error(`MT5 Runner timeout after ${timeoutMs}ms: ${pythonApiUrl}`);
        throw new GatewayTimeoutException(
          `MT5 runner timed out after ${timeoutMs}ms. Check runner health and network latency.`,
        );
      }

      this.logger.error(`Failed to reach MT5 Runner at ${pythonApiUrl}:`, e);
      throw new ServiceUnavailableException(
        'Failed to communicate with MT5 sync runner. Check MT5_RUNNER_URL, firewall rules, and runner status.',
      );
    } finally {
      clearTimeout(timeout);
    }

    if (!response.ok) {
      const detail = await this.readRunnerError(response);

      if (response.status === 401 || response.status === 403) {
        throw new BadRequestException(`MT5 runner auth failed: ${detail}`);
      }

      if (response.status >= 500) {
        throw new ServiceUnavailableException(`MT5 runner failed: ${detail}`);
      }

      throw new BadRequestException(`MT5 Sync failed: ${detail}`);
    }

    const body = await response.json().catch(() => null);
    if (!body || !Array.isArray(body.deals)) {
      throw new InternalServerErrorException('Invalid response from MT5 runner: expected deals array.');
    }

    const { deals } = body;
    if (!deals || deals.length === 0) {
      await this.prisma.tradeAccount.update({ where: { id: accountId }, data: { lastSyncTime: new Date() }});
      return { added: 0, message: 'No new deals found.' };
    }

    // Process deals -> group by position_id
    const positions = new Map<number, any>();
    
    for (const deal of deals) {
      if (!deal.position_id || deal.position_id === 0) continue;
      
      if (!positions.has(deal.position_id)) {
         positions.set(deal.position_id, { inDeals: [], outDeals: [] });
      }
      const data = positions.get(deal.position_id);
      
      if (deal.entry === 0) data.inDeals.push(deal);     
      else if (deal.entry === 1) data.outDeals.push(deal);
    }

    let addedCount = 0;

    for (const [positionId, data] of positions.entries()) {
      if (data.inDeals.length > 0 && data.outDeals.length > 0) {
        
        const firstIn = data.inDeals.sort((a: any, b: any) => a.time - b.time)[0];
        
        const totalProfit = data.outDeals.reduce((sum: number, d: any) => sum + (d.profit || 0), 0);
        const totalCommission = data.inDeals.concat(data.outDeals).reduce((sum: number, d: any) => sum + (d.commission || 0) + (d.fee || 0), 0);
        const totalSwap = data.outDeals.reduce((sum: number, d: any) => sum + (d.swap || 0), 0);
        const realisedProfitLoss = totalProfit + totalSwap;
        
        const instrument = firstIn.symbol;
        const entryDateTime = new Date(firstIn.time * 1000);
        const entryPrice = firstIn.price;
        const direction: TradeDirection = firstIn.type === 0 ? TradeDirection.BUY : TradeDirection.SELL;
        
        const result: TradeResult = realisedProfitLoss > 0 ? TradeResult.PROFIT : (realisedProfitLoss < 0 ? TradeResult.LOSS : TradeResult.BREAK_EVEN);

        try {
          await this.prisma.tradeEntry.create({
            data: {
              tradeAccountId: accountId,
              mt5TicketId: positionId.toString(),
              entryDateTime,
              instrument,
              direction,
              entryPrice,
              positionSize: firstIn.volume,
              stopLossAmount: 0,
              takeProfitAmount: 0,
              status: TradeStatus.CLOSED,
              result,
              realisedProfitLoss,
              serviceCharge: Math.abs(totalCommission), 
              notes: 'Auto-synced from MT5'
            }
          });
          addedCount++;
        } catch (error: any) {
          if (error.code !== 'P2002') {
             this.logger.error(`Error saving mapped MT5 trade ${positionId}: ${error.message}`);
          }
        }
      }
    }

    await this.prisma.tradeAccount.update({
      where: { id: accountId },
      data: { lastSyncTime: new Date() }
    });

    return { added: addedCount, message: `Successfully synced ${addedCount} new trades.` };
  }
}


