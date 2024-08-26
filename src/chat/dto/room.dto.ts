import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class RoomDto {
  @ApiProperty({
    description: 'The ID of the room',
    example: 'room123',
  })
  @IsString()
  @IsNotEmpty()
  roomId: string;
}
