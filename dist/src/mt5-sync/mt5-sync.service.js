"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var Mt5SyncService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Mt5SyncService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const config_1 = require("@nestjs/config");
const crypto = require("crypto");
const client_1 = require("@prisma/client");
let Mt5SyncService = Mt5SyncService_1 = class Mt5SyncService {
    prisma;
    config;
    logger = new common_1.Logger(Mt5SyncService_1.name);
    algorithm = 'aes-256-cbc';
    fixedKey;
    constructor(prisma, config) {
        this.prisma = prisma;
        this.config = config;
        const rawKey = this.config.get('JWT_SECRET') || 'default_secret_key_needs_32_bytes_at_least_abcdefg';
        this.fixedKey = crypto.createHash('sha256').update(String(rawKey)).digest();
    }
    encrypt(text) {
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv(this.algorithm, this.fixedKey, iv);
        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        return `${iv.toString('hex')}:${encrypted}`;
    }
    decrypt(text) {
        const textParts = text.split(':');
        const iv = Buffer.from(textParts.shift(), 'hex');
        const encryptedText = Buffer.from(textParts.join(':'), 'hex');
        const decipher = crypto.createDecipheriv(this.algorithm, this.fixedKey, iv);
        let decrypted = decipher.update(encryptedText, undefined, 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    }
    async readRunnerError(response) {
        const payload = await response.json().catch(() => null);
        if (payload?.detail) {
            return String(payload.detail);
        }
        if (payload?.message) {
            return String(payload.message);
        }
        return response.statusText || 'Unknown MT5 runner error';
    }
    async linkAccount(userId, accountId, dto) {
        const account = await this.prisma.tradeAccount.findFirst({
            where: { id: accountId, userId }
        });
        if (!account)
            throw new common_1.NotFoundException('Trade account not found');
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
    async unlinkAccount(userId, accountId) {
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
    async syncAccount(userId, accountId) {
        const account = await this.prisma.tradeAccount.findFirst({
            where: { id: accountId, userId }
        });
        if (!account)
            throw new common_1.NotFoundException('Account not found');
        if (!account.mt5Login || !account.mt5Password || !account.mt5Server) {
            throw new common_1.BadRequestException('MT5 credentials not linked to this account.');
        }
        const decryptedPassword = this.decrypt(account.mt5Password);
        const startTimestamp = account.lastSyncTime
            ? Math.floor(account.lastSyncTime.getTime() / 1000) - 86400
            : Math.floor(Date.now() / 1000) - (30 * 86400);
        const endTimestamp = Math.floor(Date.now() / 1000) + 86400;
        const pythonApiUrl = this.config.get('MT5_RUNNER_URL') || 'http://host.docker.internal:8000/api/mt5/sync';
        const runnerApiKey = this.config.get('MT5_RUNNER_API_KEY') || '';
        const timeoutMs = Number(this.config.get('MT5_RUNNER_TIMEOUT_MS') || '30000');
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
        }
        catch (e) {
            if (e.name === 'AbortError') {
                this.logger.error(`MT5 Runner timeout after ${timeoutMs}ms: ${pythonApiUrl}`);
                throw new common_1.GatewayTimeoutException(`MT5 runner timed out after ${timeoutMs}ms. Check runner health and network latency.`);
            }
            this.logger.error(`Failed to reach MT5 Runner at ${pythonApiUrl}:`, e);
            throw new common_1.ServiceUnavailableException('Failed to communicate with MT5 sync runner. Check MT5_RUNNER_URL, firewall rules, and runner status.');
        }
        finally {
            clearTimeout(timeout);
        }
        if (!response.ok) {
            const detail = await this.readRunnerError(response);
            if (response.status === 401 || response.status === 403) {
                throw new common_1.BadRequestException(`MT5 runner auth failed: ${detail}`);
            }
            if (response.status >= 500) {
                throw new common_1.ServiceUnavailableException(`MT5 runner failed: ${detail}`);
            }
            throw new common_1.BadRequestException(`MT5 Sync failed: ${detail}`);
        }
        const body = await response.json().catch(() => null);
        if (!body || !Array.isArray(body.deals)) {
            throw new common_1.InternalServerErrorException('Invalid response from MT5 runner: expected deals array.');
        }
        const { deals } = body;
        if (!deals || deals.length === 0) {
            await this.prisma.tradeAccount.update({ where: { id: accountId }, data: { lastSyncTime: new Date() } });
            return { added: 0, message: 'No new deals found.' };
        }
        const positions = new Map();
        for (const deal of deals) {
            if (!deal.position_id || deal.position_id === 0)
                continue;
            if (!positions.has(deal.position_id)) {
                positions.set(deal.position_id, { inDeals: [], outDeals: [] });
            }
            const data = positions.get(deal.position_id);
            if (deal.entry === 0)
                data.inDeals.push(deal);
            else if (deal.entry === 1)
                data.outDeals.push(deal);
        }
        let addedCount = 0;
        for (const [positionId, data] of positions.entries()) {
            if (data.inDeals.length > 0 && data.outDeals.length > 0) {
                const firstIn = data.inDeals.sort((a, b) => a.time - b.time)[0];
                const totalProfit = data.outDeals.reduce((sum, d) => sum + (d.profit || 0), 0);
                const totalCommission = data.inDeals.concat(data.outDeals).reduce((sum, d) => sum + (d.commission || 0) + (d.fee || 0), 0);
                const totalSwap = data.outDeals.reduce((sum, d) => sum + (d.swap || 0), 0);
                const realisedProfitLoss = totalProfit + totalSwap;
                const instrument = firstIn.symbol;
                const entryDateTime = new Date(firstIn.time * 1000);
                const entryPrice = firstIn.price;
                const direction = firstIn.type === 0 ? client_1.TradeDirection.BUY : client_1.TradeDirection.SELL;
                const result = realisedProfitLoss > 0 ? client_1.TradeResult.PROFIT : (realisedProfitLoss < 0 ? client_1.TradeResult.LOSS : client_1.TradeResult.BREAK_EVEN);
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
                            status: client_1.TradeStatus.CLOSED,
                            result,
                            realisedProfitLoss,
                            serviceCharge: Math.abs(totalCommission),
                            notes: 'Auto-synced from MT5'
                        }
                    });
                    addedCount++;
                }
                catch (error) {
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
};
exports.Mt5SyncService = Mt5SyncService;
exports.Mt5SyncService = Mt5SyncService = Mt5SyncService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_1.ConfigService])
], Mt5SyncService);
//# sourceMappingURL=mt5-sync.service.js.map