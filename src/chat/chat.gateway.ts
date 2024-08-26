import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import {
  ForbiddenException,
  HttpStatus,
  Logger,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { JoinRoomDto, LeaveRoomDto, SendMessageDto } from './dto';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: '/chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChatGateway.name);

  constructor(private readonly chatService: ChatService) {}

  async handleConnection(@ConnectedSocket() socket: Socket) {
    try {
      const user = await this.chatService.getUserFromSocket(socket);
      if (!user) throw new ForbiddenException('User not authenticated');

      socket.data.user = user;
      await this.chatService.addUserConnection(user.id, socket.id);

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

  async handleDisconnect(@ConnectedSocket() socket: Socket) {
    try {
      const user = socket.data.user;
      if (!user) throw new ForbiddenException('User not authenticated');
      await this.chatService.removeUserConnection(user.id);
      socket.data.user;
    } catch (err) {
      this.logger.error(err, 'Disconnect -- CHAT GATEWAY');
    }
  }

  // chat.gateway.ts
  @SubscribeMessage('join-room')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async handleJoinRoom(
    @ConnectedSocket() socket: Socket,
    @MessageBody() body: JoinRoomDto,
  ) {
    try {
      const { userBId } = body;
      const user = socket.data.user;
      if (!user) throw new ForbiddenException('User not authenticated');

      const { roomId } = await this.chatService.createRoom(user.id, userBId);

      // Join the room in Socket.IO
      socket.join(roomId);

      const otherUserSocketId = await this.chatService.getUserSocketId(userBId);

      if (otherUserSocketId) {
        const sockets = await this.server.fetchSockets();
        const otherUserSocket = sockets.find((s) => s.id === otherUserSocketId);

        if (otherUserSocket) {
          otherUserSocket.join(roomId);
        }
      }

      // Aquí es donde se modifica para enviar el `roomId` al cliente
      socket.emit('join-room-status', {
        message: `Successfully connected to the room: ${roomId}`,
        statusCode: HttpStatus.OK,
        roomId: roomId, // Incluimos el `roomId` en la respuesta
      });
    } catch (err) {
      this.logger.error(err, 'Join Room -- CHAT GATEWAY');
      socket.emit('join-room-status', {
        message: 'Failed to join the room',
        statusCode:
          err instanceof ForbiddenException
            ? HttpStatus.FORBIDDEN
            : HttpStatus.INTERNAL_SERVER_ERROR,
      });
    }
  }

  @SubscribeMessage('send-message')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async handleMessage(
    @ConnectedSocket() socket: Socket,
    @MessageBody() body: SendMessageDto,
  ) {
    try {
      const { roomId, message } = body;
      const user = socket.data.user;
      if (!user) throw new ForbiddenException('User not authenticated');

      // Guardar el mensaje en la base de datos
      await this.chatService.saveMessage(roomId, {
        senderId: user.id,
        content: message, //.content???
        timestamp: new Date(), // Usar la hora actual como marca de tiempo
      });

      // Emitir el mensaje a todos los usuarios en el room
      this.server
        .to(roomId)
        .emit('new-message', { from: user, room: roomId, message });
    } catch (err) {
      this.logger.error(err, 'Send Message -- CHAT GATEWAY');
      socket.emit('send-message-error', {
        message: 'Failed to send message',
        statusCode:
          err instanceof ForbiddenException
            ? HttpStatus.FORBIDDEN
            : HttpStatus.INTERNAL_SERVER_ERROR,
      });
    }
  }

  @SubscribeMessage('get-room-details')
  async handleGetRoomDetails(
    @ConnectedSocket() socket: Socket,
    @MessageBody() body: { roomId: string },
  ) {
    try {
      const { roomId } = body;
      const roomDetails = await this.chatService.getRoomDetails(roomId);
      socket.emit('room-details', roomDetails);
    } catch (err) {
      this.logger.error(err, 'Get Room Details -- CHAT GATEWAY');
      socket.emit('error', {
        message: 'Failed to retrieve room details',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      });
    }
  }

  @SubscribeMessage('leave-room')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async handleLeaveRoom(
    @ConnectedSocket() socket: Socket,
    @MessageBody() body: LeaveRoomDto,
  ) {
    try {
      const { roomId } = body;
      const user = socket.data.user;

      if (!user) throw new ForbiddenException('User not authenticated');

      socket.leave(roomId);
      await this.chatService.removeFromRoom(roomId, user.id);

      //   this.server.to(roomId).emit('user-left', { userId, roomId });
    } catch (err) {
      this.logger.error(err, 'Leave Room -- CHAT GATEWAY');
    }
  }
}
