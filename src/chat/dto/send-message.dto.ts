import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class SendMessageDto {
  @ApiProperty({
    description: 'The ID of the room',
    example: 'room123',
  })
  @IsString()
  @IsNotEmpty()
  roomId: string;

  @ApiProperty({
    description: 'The content of the message',
    example: 'Hello, world!',
  })
  @IsString()
  @IsNotEmpty()
  message: string;
}
