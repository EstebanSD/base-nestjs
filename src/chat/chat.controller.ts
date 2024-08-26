import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ChatService } from './chat.service';

@ApiTags('Chat Web Socket')
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('room/:roomId')
  async getRoomDetails(@Param('roomId') roomId: string) {
    return await this.chatService.getRoomDetails(roomId);
  }
}

// export class ChatDocumentationController {
//   @Post('client-event/join-room')
//   @ApiBody({ type: JoinRoomDto })
//   joinRoom(@Body() body: JoinRoomDto) {
//     return { data: body, message: 'This is just for Swagger documentation' };
//   }

//   @Post('client-event/send-message')
//   @ApiBody({ type: SendMessageDto })
//   sendMessage(@Body() body: SendMessageDto) {
//     return { data: body, message: 'This is just for Swagger documentation' };
//   }

//   @Post('client-event/leave-room')
//   @ApiBody({ type: LeaveRoomDto })
//   leaveRoom(@Body() body: LeaveRoomDto) {
//     return { data: body, message: 'This is just for Swagger documentation' };
//   }

//   @Get('websocket-events')
//   @ApiOperation({
//     summary: 'WebSocket Event Overview',
//     description: `This API provides an overview of the WebSocket events supported by the chat module. 
//                   Events include "connection-status", "new-message", etc. with their respective payloads.`,
//   })
//   @ApiResponse({ status: 200, description: 'Overview of WebSocket events' })
//   getWebSocketEvents() {
//     return [
//       {
//         event: 'connection-status',
//         description: 'Sent to the client upon connection or disconnection.',
//         data: {
//           message: 'string',
//           statusCode: 'number',
//         },
//       },
//       {
//         event: 'join-room-status',
//         description:
//           'Sent to the client when the room connection is successful or not.',
//         data: {
//           message: 'string',
//           statusCode: 'number',
//         },
//       },
//       {
//         event: 'new-message',
//         description: 'Emitted when a new message is sent in a room.',
//         data: {
//           from: 'user object',
//           room: 'string',
//           message: 'string',
//         },
//       },
//       {
//         event: 'send-message-error',
//         description:
//           'It is emitted when sending a new message in a room fails.',
//         data: {
//           message: 'string',
//           statusCode: 'number',
//         },
//       },
//     ];
//   }
// }
