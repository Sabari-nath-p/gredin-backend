import { WebSocketGateway, WebSocketServer, SubscribeMessage, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, Logger } from '@nestjs/common';
import { ChatService } from './chat.service';

@WebSocketGateway({
  namespace: '/chat',
  path: '/api/socket.io',
  cors: {
    origin: process.env.FRONTEND_URL
      ? process.env.FRONTEND_URL.split(',').map((s) => s.trim()).filter(Boolean)
      : true,
    credentials: true,
  },
})
@Injectable()
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(ChatGateway.name);

  constructor(private chatService: ChatService) {}

  @WebSocketServer()
  server!: Server;

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  // Payload should include: { userId, message, sessionId?, tradeAccountId? }
  @SubscribeMessage('chat.send')
  async handleChatSend(client: Socket, payload: any) {
    const requestId = `${client.id}-${Date.now()}`;
    const startedAt = Date.now();
    try {
      this.logger.log(`chat.send start requestId=${requestId} userId=${payload?.userId ?? 'unknown'} sessionId=${payload?.sessionId ?? 'new'}`);
      client.emit('chat.status', { status: 'processing', requestId });

      const res = await this.chatService.sendMessage(payload.userId, {
        message: payload.message,
        sessionId: payload.sessionId,
        tradeAccountId: payload.tradeAccountId,
      }, { requestId, socketId: client.id });

      client.emit('chat.assistantMessage', { assistant: res.assistantMessage, sessionId: res.sessionId });
      this.logger.log(`chat.send done requestId=${requestId} ms=${Date.now() - startedAt}`);
    } catch (err: any) {
      const message = err?.message || String(err);
      this.logger.error(`chat.send failed requestId=${requestId} ms=${Date.now() - startedAt}: ${message}`);
      client.emit('chat.error', { message, requestId });
    } finally {
      // Always resolve UI "thinking" state
      client.emit('chat.status', { status: 'done', requestId });
    }
  }
}
