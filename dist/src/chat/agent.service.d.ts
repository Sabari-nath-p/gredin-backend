import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
interface AgentResult {
    answer: string;
    sqlQuery?: string;
    sqlResult?: string;
}
export declare class AgentService {
    private config;
    private prisma;
    private readonly logger;
    private readonly apiKey;
    private readonly modelName;
    private readonly requestTimeoutMs;
    constructor(config: ConfigService, prisma: PrismaService);
    private getErrorMessage;
    process(userId: string, message: string, tradeAccountId: string | null, conversationHistory: {
        role: string;
        content: string;
    }[], requestId?: string): Promise<AgentResult>;
    private friendlyError;
    private decideAction;
    private retrySqlGeneration;
    private synthesizeAnswer;
    private executeSafeQuery;
    private callModel;
    private parseDecision;
}
export {};
