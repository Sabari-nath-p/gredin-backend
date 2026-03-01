import { PrismaService } from '../prisma/prisma.service';
import { AgentService } from './agent.service';
import { SendMessageDto } from './dto/send-message.dto';
export declare class ChatService {
    private prisma;
    private agent;
    constructor(prisma: PrismaService, agent: AgentService);
    getSessions(userId: string, page?: number, limit?: number): Promise<{
        data: ({
            tradeAccount: {
                id: string;
                accountName: string;
                brokerName: string;
            } | null;
            _count: {
                messages: number;
            };
        } & {
            title: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            tradeAccountId: string | null;
        })[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    getSession(userId: string, sessionId: string): Promise<{
        tradeAccount: {
            id: string;
            accountName: string;
            brokerName: string;
        } | null;
        messages: {
            id: string;
            role: import(".prisma/client").$Enums.ChatMessageRole;
            createdAt: Date;
            content: string;
            sqlQuery: string | null;
            sqlResult: string | null;
            sessionId: string;
        }[];
    } & {
        title: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        tradeAccountId: string | null;
    }>;
    sendMessage(userId: string, dto: SendMessageDto): Promise<{
        sessionId: any;
        userMessage: {
            id: string;
            role: import(".prisma/client").$Enums.ChatMessageRole;
            createdAt: Date;
            content: string;
            sqlQuery: string | null;
            sqlResult: string | null;
            sessionId: string;
        };
        assistantMessage: {
            id: string;
            role: import(".prisma/client").$Enums.ChatMessageRole;
            createdAt: Date;
            content: string;
            sqlQuery: string | null;
            sqlResult: string | null;
            sessionId: string;
        };
    }>;
    deleteSession(userId: string, sessionId: string): Promise<{
        deleted: boolean;
    }>;
    updateSessionTitle(userId: string, sessionId: string, title: string): Promise<{
        title: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        tradeAccountId: string | null;
    }>;
}
