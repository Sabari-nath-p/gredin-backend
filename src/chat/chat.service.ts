import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AgentService } from './agent.service';
import { SendMessageDto } from './dto/send-message.dto';

@Injectable()
export class ChatService {
  constructor(
    private prisma: PrismaService,
    private agent: AgentService,
  ) {}

  // ── List sessions ──
  async getSessions(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.chatSession.findMany({
        where: { userId },
        orderBy: { updatedAt: 'desc' },
        skip,
        take: limit,
        include: {
          tradeAccount: { select: { id: true, accountName: true, brokerName: true } },
          _count: { select: { messages: true } },
        },
      }),
      this.prisma.chatSession.count({ where: { userId } }),
    ]);
    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  // ── Get single session with messages ──
  async getSession(userId: string, sessionId: string) {
    const session = await this.prisma.chatSession.findUnique({
      where: { id: sessionId },
      include: {
        tradeAccount: { select: { id: true, accountName: true, brokerName: true } },
        messages: { orderBy: { createdAt: 'asc' } },
      },
    });
    if (!session) throw new NotFoundException('Chat session not found');
    if (session.userId !== userId) throw new ForbiddenException();
    return session;
  }

  // ── Send a message (the core flow) ──
  async sendMessage(userId: string, dto: SendMessageDto) {
    let session: any;

    if (dto.sessionId) {
      // Existing session
      session = await this.prisma.chatSession.findUnique({
        where: { id: dto.sessionId },
        include: { messages: { orderBy: { createdAt: 'asc' }, take: 20 } },
      });
      if (!session) throw new NotFoundException('Chat session not found');
      if (session.userId !== userId) throw new ForbiddenException();
    } else {
      // Create new session
      session = await this.prisma.chatSession.create({
        data: {
          userId,
          title: dto.message.substring(0, 80),
          tradeAccountId: dto.tradeAccountId || null,
        },
        include: { messages: true },
      });
    }

    const tradeAccountId = dto.tradeAccountId || session.tradeAccountId || null;

    // If account changed, update session
    if (dto.tradeAccountId && dto.tradeAccountId !== session.tradeAccountId) {
      await this.prisma.chatSession.update({
        where: { id: session.id },
        data: { tradeAccountId: dto.tradeAccountId },
      });
    }

    // Save user message
    const userMsg = await this.prisma.chatMessage.create({
      data: {
        sessionId: session.id,
        role: 'USER',
        content: dto.message,
      },
    });

    // Build conversation history for context (last N messages)
    const history = (session.messages || []).slice(-10).map((m: any) => ({
      role: m.role === 'USER' ? 'user' : 'assistant',
      content: m.content,
    }));

    // Run agent (with error safety net)
    let result: { answer: string; sqlQuery?: string; sqlResult?: string };
    try {
      result = await this.agent.process(userId, dto.message, tradeAccountId, history);
    } catch (err) {
      result = { answer: '❌ Sorry, I encountered an unexpected error. Please try again in a moment.' };
    }

    // Save assistant message
    const assistantMsg = await this.prisma.chatMessage.create({
      data: {
        sessionId: session.id,
        role: 'ASSISTANT',
        content: result.answer,
        sqlQuery: result.sqlQuery || null,
        sqlResult: result.sqlResult || null,
      },
    });

    // Auto-title: use first user message (already set on creation)
    // Update session timestamp
    await this.prisma.chatSession.update({
      where: { id: session.id },
      data: { updatedAt: new Date() },
    });

    return {
      sessionId: session.id,
      userMessage: userMsg,
      assistantMessage: assistantMsg,
    };
  }

  // ── Delete session ──
  async deleteSession(userId: string, sessionId: string) {
    const session = await this.prisma.chatSession.findUnique({ where: { id: sessionId } });
    if (!session) throw new NotFoundException('Chat session not found');
    if (session.userId !== userId) throw new ForbiddenException();
    await this.prisma.chatSession.delete({ where: { id: sessionId } });
    return { deleted: true };
  }

  // ── Update session title ──
  async updateSessionTitle(userId: string, sessionId: string, title: string) {
    const session = await this.prisma.chatSession.findUnique({ where: { id: sessionId } });
    if (!session) throw new NotFoundException('Chat session not found');
    if (session.userId !== userId) throw new ForbiddenException();
    return this.prisma.chatSession.update({
      where: { id: sessionId },
      data: { title },
    });
  }
}
