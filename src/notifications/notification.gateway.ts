import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { NotificationService } from './notification.service';
import { ForbiddenException, HttpStatus, Logger } from '@nestjs/common';
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
      const user = await this.notificationService.getUserFromSocket(socket);
      if (!user) throw new ForbiddenException('User not authenticated');

      socket.data.userId = user._id;

      socket.emit('connection-status', {
        message: 'Successfully connected to the Notification server',
        statusCode: HttpStatus.OK,
      });
    } catch (err) {
      this.logger.error(err, 'Connection -- NOTIFICATION GATEWAY');
      socket.emit('connection-status', {
        message: 'Failed to connect to the Notification server!',
        statusCode:
          err instanceof ForbiddenException
            ? HttpStatus.FORBIDDEN
            : HttpStatus.INTERNAL_SERVER_ERROR,
      });

      socket.disconnect(); // If is necessary
    }
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
      this.logger.error(err, 'Product Created -- NOTIFICATION GATEWAY');
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
      this.logger.error(err, 'Product Deleted -- NOTIFICATION GATEWAY');
    }
  }
}
