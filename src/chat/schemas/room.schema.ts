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
}

export const RoomSchema = SchemaFactory.createForClass(Room);
