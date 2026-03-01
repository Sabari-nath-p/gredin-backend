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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const agent_service_1 = require("./agent.service");
let ChatService = class ChatService {
    prisma;
    agent;
    constructor(prisma, agent) {
        this.prisma = prisma;
        this.agent = agent;
    }
    async getSessions(userId, page = 1, limit = 20) {
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
    async getSession(userId, sessionId) {
        const session = await this.prisma.chatSession.findUnique({
            where: { id: sessionId },
            include: {
                tradeAccount: { select: { id: true, accountName: true, brokerName: true } },
                messages: { orderBy: { createdAt: 'asc' } },
            },
        });
        if (!session)
            throw new common_1.NotFoundException('Chat session not found');
        if (session.userId !== userId)
            throw new common_1.ForbiddenException();
        return session;
    }
    async sendMessage(userId, dto) {
        let session;
        if (dto.sessionId) {
            session = await this.prisma.chatSession.findUnique({
                where: { id: dto.sessionId },
                include: { messages: { orderBy: { createdAt: 'asc' }, take: 20 } },
            });
            if (!session)
                throw new common_1.NotFoundException('Chat session not found');
            if (session.userId !== userId)
                throw new common_1.ForbiddenException();
        }
        else {
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
        if (dto.tradeAccountId && dto.tradeAccountId !== session.tradeAccountId) {
            await this.prisma.chatSession.update({
                where: { id: session.id },
                data: { tradeAccountId: dto.tradeAccountId },
            });
        }
        const userMsg = await this.prisma.chatMessage.create({
            data: {
                sessionId: session.id,
                role: 'USER',
                content: dto.message,
            },
        });
        const history = (session.messages || []).slice(-10).map((m) => ({
            role: m.role === 'USER' ? 'user' : 'assistant',
            content: m.content,
        }));
        const result = await this.agent.process(userId, dto.message, tradeAccountId, history);
        const assistantMsg = await this.prisma.chatMessage.create({
            data: {
                sessionId: session.id,
                role: 'ASSISTANT',
                content: result.answer,
                sqlQuery: result.sqlQuery || null,
                sqlResult: result.sqlResult || null,
            },
        });
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
    async deleteSession(userId, sessionId) {
        const session = await this.prisma.chatSession.findUnique({ where: { id: sessionId } });
        if (!session)
            throw new common_1.NotFoundException('Chat session not found');
        if (session.userId !== userId)
            throw new common_1.ForbiddenException();
        await this.prisma.chatSession.delete({ where: { id: sessionId } });
        return { deleted: true };
    }
    async updateSessionTitle(userId, sessionId, title) {
        const session = await this.prisma.chatSession.findUnique({ where: { id: sessionId } });
        if (!session)
            throw new common_1.NotFoundException('Chat session not found');
        if (session.userId !== userId)
            throw new common_1.ForbiddenException();
        return this.prisma.chatSession.update({
            where: { id: sessionId },
            data: { title },
        });
    }
};
exports.ChatService = ChatService;
exports.ChatService = ChatService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        agent_service_1.AgentService])
], ChatService);
//# sourceMappingURL=chat.service.js.map