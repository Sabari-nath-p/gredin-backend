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
    try {
      client.emit('chat.status', { status: 'processing' });

      const res = await this.chatService.sendMessage(payload.userId, {
        message: payload.message,
        sessionId: payload.sessionId,
        tradeAccountId: payload.tradeAccountId,
      });

      client.emit('chat.assistantMessage', { assistant: res.assistantMessage, sessionId: res.sessionId });
      client.emit('chat.status', { status: 'done' });
    } catch (err: any) {
      this.logger.error(`chat.send failed: ${err?.message || err}`);
      client.emit('chat.error', { message: err?.message || 'Chat failed' });
    }
  }
}
