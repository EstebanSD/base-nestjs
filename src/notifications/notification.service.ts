import { Injectable, Logger } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { AuthService } from 'src/auth/auth.service';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(private readonly authService: AuthService) {}

  async getUserFromSocket(socket: Socket) {
    const authToken = socket.handshake.headers.authorization?.split(' ')[1];
    if (!authToken) {
      this.logger.error(
        'Authentication token not provided',
        'Notification -- SERVICE',
      );
      throw new WsException('Authentication token not provided');
    }

    const user =
      await this.authService.getUserFromAuthenticationToken(authToken);
    if (!user) {
      this.logger.error('Invalid credentials', 'Notification -- SERVICE');
      throw new WsException('Invalid credentials');
    }

    return user;
  }
}
