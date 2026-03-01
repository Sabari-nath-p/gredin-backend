import {
  Controller, Get, Post, Delete, Put, Body, Param, Query,
  UseGuards, Req, ParseIntPipe, DefaultValuePipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ChatService } from './chat.service';
import { SendMessageDto } from './dto/send-message.dto';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private chat: ChatService) {}

  // GET /chat/sessions - List user's sessions
  @Get('sessions')
  getSessions(
    @Req() req: any,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.chat.getSessions(req.user.userId, page, limit);
  }

  // GET /chat/sessions/:id - Get session with messages
  @Get('sessions/:id')
  getSession(@Req() req: any, @Param('id') id: string) {
    return this.chat.getSession(req.user.userId, id);
  }

  // POST /chat/send - Send a message (creates session if needed)
  @Post('send')
  sendMessage(@Req() req: any, @Body() dto: SendMessageDto) {
    return this.chat.sendMessage(req.user.userId, dto);
  }

  // PUT /chat/sessions/:id/title - Rename session
  @Put('sessions/:id/title')
  updateTitle(
    @Req() req: any,
    @Param('id') id: string,
    @Body('title') title: string,
  ) {
    return this.chat.updateSessionTitle(req.user.userId, id, title);
  }

  // DELETE /chat/sessions/:id - Delete session
  @Delete('sessions/:id')
  deleteSession(@Req() req: any, @Param('id') id: string) {
    return this.chat.deleteSession(req.user.userId, id);
  }
}
