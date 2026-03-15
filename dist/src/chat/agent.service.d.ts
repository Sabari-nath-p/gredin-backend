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
    constructor(config: ConfigService, prisma: PrismaService);
    process(userId: string, message: string, tradeAccountId: string | null, conversationHistory: {
        role: string;
        content: string;
    }[]): Promise<AgentResult>;
    private friendlyError;
    private decideAction;
    private retrySqlGeneration;
    private synthesizeAnswer;
    private executeSafeQuery;
    private callGemini;
    private parseDecision;
}
export {};
