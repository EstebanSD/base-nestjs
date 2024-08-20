import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ForbiddenException, HttpStatus, Logger } from '@nestjs/common';
import { ChatService } from './chat.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: '/chat',
})
export class ChatGateway implements OnGatewayConnection {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChatGateway.name);

  constructor(private readonly chatService: ChatService) {}

  async handleConnection(@ConnectedSocket() socket: Socket) {
    try {
      const user = await this.chatService.getUserFromSocket(socket);
      if (!user) throw new ForbiddenException('User not authenticated');

      // this.chatService.addUserConnection(user.id, socket);

      const { roomIds } = await this.chatService.findAllRooms(user.id);

      roomIds.forEach((roomId) => {
        socket.join(roomId);
      });

      socket.emit('connection-status', {
        message: 'Successfully connected to the Chat server',
        statusCode: HttpStatus.OK,
      });

      // this.server.emit('connected-users', this.chatService.getConnectedUsers());
    } catch (err) {
      this.logger.error(err, 'Connection -- CHAT GATEWAY');
      socket.emit('connection-status', {
        message: 'Failed to connect to the Chat server',
        statusCode:
          err instanceof ForbiddenException
            ? HttpStatus.FORBIDDEN
            : HttpStatus.INTERNAL_SERVER_ERROR,
      });

      socket.disconnect(); // If is necessary
    }
  }

  // handleDisconnect(@ConnectedSocket() socket: Socket) {
  //   try {
  //     const userId = socket.data.userId;
  //     const roomId = socket.data.roomId;
  //     if (userId) {
  //       this.chatService.removeUserConnection(userId, socket);
  //       this.server.emit(
  //         'connected-users',
  //         this.chatService.getConnectedUsers(),
  //       );
  //       if (roomId) {
  //         socket.to(roomId).emit('user-left', { userId, roomId });
  //       }
  //     }
  //   } catch (err) {
  //     this.logger.error(err, 'Disconnect -- CHAT GATEWAY');
  //   }
  // }

  @SubscribeMessage('join-room')
  async handleJoinRoom(
    @ConnectedSocket() socket: Socket,
    @MessageBody() body: any,
  ) {
    try {
      const { userAId, userBId } = body;
      const { roomId } = await this.chatService.createRoom(userAId, userBId);

      socket.join(roomId);
      socket.emit('join-room-status', {
        roomId,
        statusCode: HttpStatus.OK,
      });
    } catch (err) {
      this.logger.error(err, 'Join Room -- CHAT GATEWAY');
      socket.emit('join-room-status', {
        message: 'Failed to join the room',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      });
    }
  }

  @SubscribeMessage('send-message')
  async handleMessage(
    @ConnectedSocket() socket: Socket,
    @MessageBody() body: any,
  ) {
    try {
      const { roomId, message } = body;
      if (!roomId) {
        throw new Error('RoomId not found');
      }

      this.server
        .to(roomId)
        .emit('new-message', { from: socket.data.userId, message });
    } catch (err) {
      this.logger.error(err, 'Send Message -- CHAT GATEWAY');
      socket.emit('send-message-error', {
        message: 'Failed to send message',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      });
    }
  }

  @SubscribeMessage('leave-room')
  async handleLeaveRoom(
    @ConnectedSocket() socket: Socket,
    @MessageBody() body: any,
  ) {
    try {
      const { roomId, userId } = body;
      socket.leave(roomId);

      await this.chatService.removeFromRoom(roomId, userId);

      //   this.server.to(roomId).emit('user-left', { userId, roomId });
    } catch (err) {
      this.logger.error(err, 'Leave Room -- CHAT GATEWAY');
    }
  }
}
