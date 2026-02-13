import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTradeAccountDto } from './dto/create-trade-account.dto';
import { UpdateTradeAccountDto } from './dto/update-trade-account.dto';
import { TradeAccount, UserRole } from '@prisma/client';

@Injectable()
export class TradeAccountService {
  constructor(private prisma: PrismaService) { }

  async create(userId: string, createDto: CreateTradeAccountDto): Promise<TradeAccount> {
    return this.prisma.tradeAccount.create({
      data: {
        userId,
        accountName: createDto.accountName,
        brokerName: createDto.brokerName,
        marketSegment: createDto.marketSegment,
        currencyCode: createDto.currencyCode || 'USD',
        initialBalance: createDto.initialBalance,
        currentBalance: createDto.initialBalance, // Set current balance same as initial
        accountType: createDto.accountType,
      },
    });
  }

  async findAllByUser(userId: string): Promise<TradeAccount[]> {
    return this.prisma.tradeAccount.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string, userRole: UserRole): Promise<TradeAccount> {
    const account = await this.prisma.tradeAccount.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    if (!account) {
      throw new NotFoundException('Trade account not found');
    }

    // Check if user has access to this account
    if (account.userId !== userId && userRole !== UserRole.SUPER_ADMIN) {
      throw new ForbiddenException('You do not have access to this account');
    }

    return account;
  }

  async update(
    id: string,
    userId: string,
    userRole: UserRole,
    updateDto: UpdateTradeAccountDto,
  ): Promise<TradeAccount> {
    const account = await this.prisma.tradeAccount.findUnique({
      where: { id },
    });

    if (!account) {
      throw new NotFoundException('Trade account not found');
    }

    // Check if user has access to this account
    if (account.userId !== userId && userRole !== UserRole.SUPER_ADMIN) {
      throw new ForbiddenException('You do not have access to this account');
    }

    return this.prisma.tradeAccount.update({
      where: { id },
      data: updateDto,
    });
  }

  async delete(id: string, userId: string, userRole: UserRole): Promise<TradeAccount> {
    const account = await this.prisma.tradeAccount.findUnique({
      where: { id },
    });

    if (!account) {
      throw new NotFoundException('Trade account not found');
    }

    // Check if user has access to this account
    if (account.userId !== userId && userRole !== UserRole.SUPER_ADMIN) {
      throw new ForbiddenException('You do not have access to this account');
    }

    return this.prisma.tradeAccount.delete({
      where: { id },
    });
  }

  // Admin methods
  async findAll(): Promise<TradeAccount[]> {
    return this.prisma.tradeAccount.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getAccountStats() {
    const totalAccounts = await this.prisma.tradeAccount.count();
    const activeAccounts = await this.prisma.tradeAccount.count({
      where: { isActive: true },
    });
    const accountsByType = await this.prisma.tradeAccount.groupBy({
      by: ['accountType'],
      _count: true,
    });
    const accountsBySegment = await this.prisma.tradeAccount.groupBy({
      by: ['marketSegment'],
      _count: true,
    });

    return {
      totalAccounts,
      activeAccounts,
      inactiveAccounts: totalAccounts - activeAccounts,
      accountsByType,
      accountsBySegment,
    };
  }
}
