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
var AgentService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../prisma/prisma.service");
const DB_SCHEMA_XML = `<schema>
<table name="TradeAccount">
  <col name="id" type="uuid" pk="true"/>
  <col name="userId" type="uuid"/>
  <col name="accountName" type="string"/>
  <col name="brokerName" type="string"/>
  <col name="marketSegment" type="enum(STOCK,AUCTION,FUTURES,OPTIONS,FOREX,CRYPTO,COMMODITIES)"/>
  <col name="currencyCode" type="string" default="USD"/>
  <col name="initialBalance" type="decimal(15,2)"/>
  <col name="currentBalance" type="decimal(15,2)"/>
  <col name="accountType" type="enum(DEMO,LIVE,FUNDED)"/>
  <col name="isActive" type="boolean"/>
  <col name="createdAt" type="datetime"/>
</table>
<table name="TradeEntry">
  <col name="id" type="uuid" pk="true"/>
  <col name="tradeAccountId" type="uuid" fk="TradeAccount.id"/>
  <col name="entryDateTime" type="datetime"/>
  <col name="instrument" type="string"/>
  <col name="direction" type="enum(BUY,SELL)"/>
  <col name="entryPrice" type="decimal(15,2)" nullable="true"/>
  <col name="positionSize" type="int" nullable="true"/>
  <col name="stopLossAmount" type="decimal(15,2)"/>
  <col name="takeProfitAmount" type="decimal(15,2)"/>
  <col name="status" type="enum(OPEN,CLOSED)"/>
  <col name="result" type="enum(PROFIT,LOSS,BREAK_EVEN)" nullable="true"/>
  <col name="realisedProfitLoss" type="decimal(15,2)" nullable="true"/>
  <col name="serviceCharge" type="decimal(15,2)"/>
  <col name="notes" type="text" nullable="true"/>
  <col name="createdAt" type="datetime"/>
</table>
</schema>`;
let AgentService = AgentService_1 = class AgentService {
    config;
    prisma;
    logger = new common_1.Logger(AgentService_1.name);
    apiKey;
    modelName;
    constructor(config, prisma) {
        this.config = config;
        this.prisma = prisma;
        this.apiKey = this.config.get('GEMINI_API_KEY') || '';
        this.modelName = this.config.get('GEMINI_MODEL') || 'gemini-2.0-flash';
    }
    async process(userId, message, tradeAccountId, conversationHistory) {
        if (!this.apiKey) {
            return {
                answer: 'The AI assistant is not configured. Please set the GEMINI_API_KEY environment variable.',
            };
        }
        let decision;
        try {
            decision = await this.decideAction(userId, message, tradeAccountId, conversationHistory);
        }
        catch (err) {
            this.logger.error(`Agent decision failed: ${err.message}`);
            return { answer: this.friendlyError(err.message) };
        }
        if (!decision.needsData) {
            return { answer: decision.directAnswer || 'I could not generate a response.' };
        }
        const sqlQuery = decision.sqlQuery;
        let sqlResult;
        try {
            const rows = await this.executeSafeQuery(sqlQuery, userId, tradeAccountId);
            sqlResult = JSON.stringify(rows);
        }
        catch (err) {
            this.logger.warn(`SQL execution failed: ${err.message}`);
            const retryDecision = await this.retrySqlGeneration(userId, message, tradeAccountId, sqlQuery, err.message, conversationHistory);
            if (!retryDecision.needsData || !retryDecision.sqlQuery) {
                return { answer: retryDecision.directAnswer || 'I was unable to query your data. Please rephrase your question.' };
            }
            try {
                const retryRows = await this.executeSafeQuery(retryDecision.sqlQuery, userId, tradeAccountId);
                sqlResult = JSON.stringify(retryRows);
            }
            catch (retryErr) {
                return { answer: `I tried to query your data but encountered an error. Could you rephrase your question?\n\nError: ${retryErr.message}` };
            }
            try {
                return await this.synthesizeAnswer(message, retryDecision.sqlQuery, sqlResult, conversationHistory);
            }
            catch (synthErr) {
                this.logger.error(`Synthesis failed after retry: ${synthErr.message}`);
                return { answer: this.friendlyError(synthErr.message), sqlQuery: retryDecision.sqlQuery, sqlResult };
            }
        }
        try {
            return await this.synthesizeAnswer(message, sqlQuery, sqlResult, conversationHistory);
        }
        catch (err) {
            this.logger.error(`Synthesis failed: ${err.message}`);
            return { answer: this.friendlyError(err.message), sqlQuery, sqlResult };
        }
    }
    friendlyError(msg) {
        if (msg.includes('RATE_LIMITED')) {
            return '⏳ The AI service is temporarily busy due to rate limits. Please wait a minute and try again.';
        }
        if (msg.includes('AUTH_FAILED')) {
            return '🔑 The AI service is not properly configured. Please contact the administrator.';
        }
        return '❌ Something went wrong while processing your request. Please try again in a moment.';
    }
    async decideAction(userId, message, tradeAccountId, history) {
        const accountFilter = tradeAccountId
            ? `The user has selected account ID: "${tradeAccountId}". Scope queries to this account's trades.`
            : `No specific account selected. The user's ID is "${userId}". Query across ALL their accounts (join TradeEntry with TradeAccount WHERE TradeAccount.userId = '${userId}').`;
        const historyXml = history.length
            ? `<history>\n${history.slice(-6).map(h => `<msg role="${h.role}">${h.content.substring(0, 300)}</msg>`).join('\n')}\n</history>`
            : '';
        const prompt = `You are a trading journal AI assistant. Decide whether the user's question requires querying their trade data from a MySQL database.

${DB_SCHEMA_XML}

${accountFilter}

${historyXml}

<rules>
- If the question requires trade data, stats, performance metrics, or account information, respond with a READ-ONLY SELECT query.
- NEVER use UPDATE, DELETE, INSERT, DROP, ALTER, CREATE, TRUNCATE, or any write operation.
- Always filter by userId or tradeAccountId to ensure data isolation.
- Use proper MySQL syntax. Table names are exactly: TradeAccount, TradeEntry.
- For general questions, greetings, trading advice (not about their data), respond directly.
- Keep SQL concise. Use aggregates when possible to minimize data transfer.
</rules>

<user_message>${message}</user_message>

Respond in EXACTLY one of these two XML formats:

Format A (needs data):
<decision><action>query</action><sql>YOUR SELECT QUERY HERE</sql></decision>

Format B (direct answer):
<decision><action>direct</action><answer>Your helpful answer here</answer></decision>`;
        const response = await this.callGemini(prompt);
        return this.parseDecision(response);
    }
    async retrySqlGeneration(userId, message, tradeAccountId, failedSql, errorMsg, history) {
        const accountFilter = tradeAccountId
            ? `Scope to account ID: "${tradeAccountId}".`
            : `User ID: "${userId}". Join TradeEntry with TradeAccount WHERE TradeAccount.userId = '${userId}'.`;
        const prompt = `The previous SQL query failed. Fix it.

${DB_SCHEMA_XML}

${accountFilter}

<failed_sql>${failedSql}</failed_sql>
<error>${errorMsg}</error>
<user_message>${message}</user_message>

Respond in XML:
<decision><action>query</action><sql>CORRECTED SELECT QUERY</sql></decision>

Or if you cannot fix it:
<decision><action>direct</action><answer>Explanation of why</answer></decision>`;
        const response = await this.callGemini(prompt);
        return this.parseDecision(response);
    }
    async synthesizeAnswer(message, sqlQuery, sqlResult, history) {
        const truncatedResult = sqlResult.length > 8000 ? sqlResult.substring(0, 8000) + '...(truncated)' : sqlResult;
        const historyXml = history.length
            ? `<history>\n${history.slice(-4).map(h => `<msg role="${h.role}">${h.content.substring(0, 200)}</msg>`).join('\n')}\n</history>`
            : '';
        const prompt = `You are a trading journal AI assistant. Answer the user's question using the data retrieved from their database.

${historyXml}

<user_question>${message}</user_question>

<data>${truncatedResult}</data>

<rules>
- Provide a clear, concise, helpful analysis of their trading data.
- Use numbers, percentages, and specific values from the data.
- Format currency values properly.
- If data is empty, say so clearly and suggest what the user could do.
- Be encouraging but honest about performance.
- Use markdown formatting for readability (bold, lists, etc.).
- Do NOT include raw JSON or SQL in your response.
- Keep the answer focused and under 500 words.
</rules>`;
        const answer = await this.callGemini(prompt);
        return {
            answer: answer || 'I was unable to analyze the data.',
            sqlQuery,
            sqlResult: truncatedResult,
        };
    }
    async executeSafeQuery(sql, userId, tradeAccountId) {
        const normalized = sql.trim().replace(/\s+/g, ' ');
        const upper = normalized.toUpperCase();
        const forbidden = ['INSERT', 'UPDATE', 'DELETE', 'DROP', 'ALTER', 'CREATE', 'TRUNCATE', 'GRANT', 'REVOKE', 'EXEC', 'EXECUTE', 'CALL'];
        for (const keyword of forbidden) {
            if (new RegExp(`\\b${keyword}\\b`).test(upper)) {
                throw new Error(`Forbidden operation: ${keyword} is not allowed`);
            }
        }
        if (!upper.startsWith('SELECT')) {
            throw new Error('Only SELECT queries are allowed');
        }
        const hasUserFilter = upper.includes(userId.toUpperCase()) ||
            (tradeAccountId && upper.includes(tradeAccountId.toUpperCase())) ||
            upper.includes('USERID') || upper.includes('TRADEACCOUNTID');
        if (!hasUserFilter) {
            throw new Error('Query must filter by userId or tradeAccountId for data isolation');
        }
        const result = await this.prisma.$queryRawUnsafe(`${sql} LIMIT 500`);
        return result;
    }
    async callGemini(prompt) {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.modelName}:generateContent?key=${this.apiKey}`;
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: {
                        temperature: 0.1,
                        maxOutputTokens: 1024,
                        topP: 0.8,
                    },
                    safetySettings: [
                        { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
                        { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
                        { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
                        { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
                    ],
                }),
            });
            if (!response.ok) {
                const errBody = await response.text();
                this.logger.error(`Gemini API error ${response.status}: ${errBody}`);
                if (response.status === 429) {
                    throw new Error('RATE_LIMITED: The AI service is temporarily busy. Please wait a moment and try again.');
                }
                if (response.status === 403) {
                    throw new Error('AUTH_FAILED: The AI API key is invalid or expired. Please check configuration.');
                }
                throw new Error(`Gemini API returned ${response.status}`);
            }
            const data = await response.json();
            const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
            return text.trim();
        }
        catch (err) {
            this.logger.error(`Gemini call failed: ${err.message}`);
            throw err;
        }
    }
    parseDecision(xml) {
        try {
            const actionMatch = xml.match(/<action>(.*?)<\/action>/s);
            const action = actionMatch?.[1]?.trim() || '';
            if (action === 'query') {
                const sqlMatch = xml.match(/<sql>(.*?)<\/sql>/s);
                const sql = sqlMatch?.[1]?.trim() || '';
                if (sql) {
                    return { needsData: true, sqlQuery: sql };
                }
            }
            const answerMatch = xml.match(/<answer>(.*?)<\/answer>/s);
            const answer = answerMatch?.[1]?.trim() || '';
            if (answer) {
                return { needsData: false, directAnswer: answer };
            }
            return { needsData: false, directAnswer: xml };
        }
        catch {
            return { needsData: false, directAnswer: xml };
        }
    }
};
exports.AgentService = AgentService;
exports.AgentService = AgentService = AgentService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        prisma_service_1.PrismaService])
], AgentService);
//# sourceMappingURL=agent.service.js.map