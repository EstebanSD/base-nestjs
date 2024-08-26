import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { UsersModule } from 'src/users/users.module';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Room, RoomSchema } from './schemas/room.schema';
import { ChatDocumentationController } from './chat.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Room.name, schema: RoomSchema }]),
    AuthModule,
    UsersModule,
  ],
  controllers: [ChatDocumentationController],
  providers: [ChatGateway, ChatService],
  exports: [],
})
export class ChatModule {}
