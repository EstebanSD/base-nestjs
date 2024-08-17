import { Injectable, Logger } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { AuthService } from 'src/auth/auth.service';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

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

  async productInfo(id: string) {
    try {
      const { data } = await this.usersService.findOne(id);
      return data;
    } catch (err) {
      this.logger.error(
        'An error occurred trying to get the user',
        'Notification -- SERVICE',
      );
      throw new WsException('An error occurred trying to get the user');
    }
  }
}
