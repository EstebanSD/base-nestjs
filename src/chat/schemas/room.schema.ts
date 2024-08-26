import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { User } from 'src/users/schemas/users.schema';

export type RoomDocument = mongoose.HydratedDocument<Room>;

@Schema()
export class Room {
  @Prop({ unique: true, required: true })
  roomId: string;

  @Prop({
    type: [
      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
    ],
  })
  user: User[];

  // Agregamos una nueva propiedad para almacenar los mensajes
  @Prop({
    type: [{ senderId: String, content: String, timestamp: Date }],
    default: [],
  })
  messages: { senderId: string; content: string; timestamp: Date }[];
}

export const RoomSchema = SchemaFactory.createForClass(Room);
