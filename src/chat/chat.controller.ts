import { Controller, Get, Param } from '@nestjs/common';
import {
  ApiExtraModels,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ChatService } from './chat.service';
import { JoinRoomDto, RoomDto, SendMessageDto } from './dto';

@ApiTags('chat')
@ApiExtraModels(SendMessageDto, JoinRoomDto, RoomDto)
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('room/:roomId')
  async getRoomDetails(@Param('roomId') roomId: string) {
    return await this.chatService.getRoomDetails(roomId);
  }

  @Get('websocket-events')
  @ApiOperation({
    summary: 'WebSocket Event Overview',
    description: `This API provides an overview of the WebSocket events supported by the chat module.
                  Events include "connection-status", "new-message", etc. with their respective payloads.`,
  })
  @ApiResponse({ status: 200, description: 'Overview of WebSocket events' })
  getWebSocketEvents() {
    return [
      {
        type: 'client-emit',
        event: 'join-room',
        body: 'JoinRoomDto',
      },
      {
        type: 'client-emit',
        event: 'send-message',
        body: 'SendMessageDto',
      },
      {
        type: 'client-emit',
        event: 'leave-room',
        body: 'RoomDto',
      },
      {
        type: 'client-emit',
        event: 'get-room-details',
        body: 'RoomDto',
      },
      {
        type: 'client-subscribe',
        event: 'connection-status',
        description: 'Sent to the client upon connection or disconnection.',
        data: {
          message: 'string',
          statusCode: 'number',
        },
      },
      {
        type: 'client-subscribe',
        event: 'join-room-status',
        description:
          'Sent to the client when the room connection is successful or not.',
        data: {
          message: 'string',
          statusCode: 'number',
          roomId: 'string || null',
        },
      },
      {
        type: 'client-subscribe',
        event: 'new-message',
        description: 'Emitted when a new message is sent in a room.',
        data: {
          from: 'user object',
          room: 'string',
          message: 'string',
        },
      },
      {
        type: 'client-subscribe',
        event: 'send-message-error',
        description:
          'It is emitted when sending a new message in a room fails.',
        data: {
          message: 'string',
          statusCode: 'number',
        },
      },
      {
        type: 'client-subscribe',
        event: 'room-details',
        description: 'string',
        data: 'any',
      },
    ];
  }
}
