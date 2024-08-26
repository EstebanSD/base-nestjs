import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { AuthService } from 'src/auth/auth.service';
import { Room } from './schemas/room.schema';
import { Model } from 'mongoose';
import { RedisClientType, createClient } from 'redis';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  // private connectedUsers: Map<string, Socket[]> = new Map();
  private redisClient: RedisClientType;

  constructor(
    @InjectModel(Room.name) private roomModel: Model<Room>,
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {
    (this.redisClient = createClient({
      url: this.configService.get<string>('redisUrl'),
    })),
      this.redisClient.connect().catch((err) => {
        this.logger.error('Failed to connect to Redis', err);
      });
  }

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

  // addUserConnection(userId: string, socket: Socket) {
  //   if (this.connectedUsers.has(userId)) {
  //     this.connectedUsers.get(userId)?.push(socket);
  //   } else {
  //     this.connectedUsers.set(userId, [socket]);
  //   }

  //   socket.data.userId = userId;
  // }
  // removeUserConnection(userId: string, socket: Socket) {
  //   const userSockets = this.connectedUsers.get(userId);
  //   if (userSockets) {
  //     const index = userSockets.indexOf(socket);
  //     if (index !== -1) {
  //       userSockets.splice(index, 1);
  //     }
  //     if (userSockets.length === 0) {
  //       this.connectedUsers.delete(userId);
  //     }
  //   }
  // }
  // getConnectedUsers(): string[] {
  //   return Array.from(this.connectedUsers.keys());
  // }

  async addUserConnection(userId: string, socketId: string): Promise<void> {
    try {
      await this.redisClient.hSet('online-users', userId, socketId);
    } catch (err) {
      this.logger.error('Failed to add user connection', err);
    }
  }

  async removeUserConnection(userId: string): Promise<void> {
    try {
      await this.redisClient.hDel('online-users', userId);
    } catch (err) {
      this.logger.error('Failed to remove user connection', err);
    }
  }

  async getUserSocketId(userId: string): Promise<string | null> {
    try {
      return await this.redisClient.hGet('online-users', userId);
    } catch (err) {
      this.logger.error('Failed to get user socket ID', err);
      return null;
    }
  }

  async isUserConnected(userId: string): Promise<boolean> {
    try {
      const socketId = await this.getUserSocketId(userId);
      return socketId !== null;
    } catch (err) {
      this.logger.error('Failed to check user connection', err);
      return false;
    }
  }

  /// Room Service ///
  // Actualizamos la creación de room para inicializar los mensajes
  async createRoom(userAId: string, userBId: string) {
    try {
      const roomId = this.generateRoomId(userAId, userBId);

      let room = await this.roomModel.findOne({ roomId });
      if (!room) {
        room = await this.roomModel.create({
          user: [userAId, userBId],
          roomId,
          messages: [], // Inicializamos el array de mensajes vacío
        });
      } else {
        const userSet = new Set(room.user.map((id) => id.toString()));
        if (!userSet.has(userAId) || !userSet.has(userBId)) {
          const users = Array.from(new Set([userAId, userBId]));
          await this.roomModel.findByIdAndUpdate(room._id, { user: users });
        }
      }

      return { roomId: room.roomId };
    } catch (err) {
      this.logger.error(err, 'ROOM CREATE -- CHAT SERVICE');
    }
  }

  // Agregamos un nuevo método para guardar mensajes en la base de datos
  async saveMessage(
    roomId: string,
    message: { senderId: string; content: string; timestamp: Date },
  ) {
    try {
      await this.roomModel.updateOne(
        { roomId },
        { $push: { messages: message } },
      );
    } catch (err) {
      this.logger.error(err, 'SAVE MESSAGE -- CHAT SERVICE');
    }
  }

  // Método para obtener los detalles del room (incluyendo mensajes)
  async getRoomDetails(roomId: string) {
    try {
      const room = await this.roomModel.findOne({ roomId }).populate('user');
      if (!room) {
        throw new Error('Room not found');
      }

      return room;
    } catch (err) {
      this.logger.error(err, 'GET ROOM DETAILS -- CHAT SERVICE');
      throw new Error('Failed to retrieve room details');
    }
  }

  async findAllRooms(userId: string) {
    try {
      const rooms = await this.roomModel.find({ user: userId });

      const roomIds: string[] = rooms.map((item) => item.roomId);

      return { roomIds };
    } catch (err) {
      this.logger.error(err, 'ROOMS FIND ALL -- CHAT SERVICE');
    }
  }

  async removeFromRoom(roomId: string, userId: string) {
    try {
      const room = await this.roomModel.findOne({ roomId });
      if (room) {
        room.user = room.user.filter((user) => String(user) !== userId);
        if (room.user.length > 0) {
          await room.save();
        } else {
          await room.deleteOne();
        }
      }
    } catch (err) {
      this.logger.error(err, 'REMOVE ROOM OR ONE USER -- CHAT SERVICE');
    }
  }
}
