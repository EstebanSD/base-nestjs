import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  SubscribeMessage,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { NotificationService } from './notification.service';
import { ForbiddenException, Logger } from '@nestjs/common';
import { IUser } from 'src/common/interfaces/user.interface';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: '/notifications',
})
export class NotificationGateway implements OnGatewayConnection {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationGateway.name);

  constructor(private readonly notificationService: NotificationService) {}

  async handleConnection(socket: Socket) {
    try {
      const userId = await this.notificationService.getUserFromSocket(socket);
      if (!userId) throw new ForbiddenException('User not authenticated');

      socket.data.userId = userId;

      socket.emit('connect-success', {
        message: 'Successfully connected to the WebSocket server!',
      });
    } catch (error) {
      socket.emit('connect-error', {
        message: 'Failed to connect to the WebSocket server!',
      });

      socket.disconnect(); // If is necessary
    }
  }

  // Subscribe Doc Example
  @SubscribeMessage('events')
  handleExampleEvent(@MessageBody() data: string): string {
    return data;
  }

  notifyProductCreated(user: IUser, productName: string) {
    try {
      // const notify = await this.notificationService...; // Create notify entity maybe?

      this.server.sockets.sockets.forEach((socket) => {
        if (socket.data.userId !== user.id) {
          socket.emit('productCreated', { userName: user.name, productName });
        }
      });
    } catch (err) {
      this.logger.error(err, 'Notification Product Created -- GATEWAY');
    }
  }

  notifyProductDeleted(user: IUser, productName: string) {
    try {
      // const notify = await this.notificationService...; // Create notify entity maybe?

      this.server.sockets.sockets.forEach((socket) => {
        if (socket.data.userId !== user.id) {
          socket.emit('productDeleted', { userName: user.name, productName });
        }
      });
    } catch (err) {
      this.logger.error(err, 'Notification Product Deleted -- GATEWAY');
    }
  }
}
