import { Injectable, Logger } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { AuthService } from 'src/auth/auth.service';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  private connectedUsers: Map<string, Socket[]> = new Map();

  constructor(private readonly authService: AuthService) {}

  async getUserFromSocket(socket: Socket) {
    const authToken = socket.handshake.headers.authorization?.split(' ')[1];
    if (!authToken) {
      this.logger.error('Authentication token not provided', 'Chat -- SERVICE');
      throw new WsException('Authentication token not provided');
    }

    const user =
      await this.authService.getUserFromAuthenticationToken(authToken);
    if (!user) {
      this.logger.error('Invalid credentials', 'Chat -- SERVICE');
      throw new WsException('Invalid credentials');
    }

    return user;
  }

  generateRoomId(userAId: string, userBId: string): string {
    return [userAId, userBId].sort().join('-');
  }

  addUserConnection(userId: string, socket: Socket) {
    if (this.connectedUsers.has(userId)) {
      this.connectedUsers.get(userId)?.push(socket);
    } else {
      this.connectedUsers.set(userId, [socket]);
    }

    socket.data.userId = userId;
  }

  removeUserConnection(userId: string, socket: Socket) {
    const userSockets = this.connectedUsers.get(userId);
    if (userSockets) {
      const index = userSockets.indexOf(socket);
      if (index !== -1) {
        userSockets.splice(index, 1);
      }
      if (userSockets.length === 0) {
        this.connectedUsers.delete(userId);
      }
    }
  }

  getConnectedUsers(): string[] {
    return Array.from(this.connectedUsers.keys());
  }
}
