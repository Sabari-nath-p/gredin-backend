import { ChatService } from './chat.service';
import { SendMessageDto } from './dto/send-message.dto';
export declare class ChatController {
    private chat;
    constructor(chat: ChatService);
    getSessions(req: any, page: number, limit: number): Promise<{
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
    getSession(req: any, id: string): Promise<{
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
    sendMessage(req: any, dto: SendMessageDto): Promise<{
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
    updateTitle(req: any, id: string, title: string): Promise<{
        title: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        tradeAccountId: string | null;
    }>;
    deleteSession(req: any, id: string): Promise<{
        deleted: boolean;
    }>;
}
