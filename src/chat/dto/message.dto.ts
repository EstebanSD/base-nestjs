import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsNotEmpty, IsString } from 'class-validator';

export class MessageDto {
  @ApiProperty({
    description: 'The ID of the user',
    example: 'user123',
  })
  @IsString()
  @IsNotEmpty()
  senderId: string;

  @ApiProperty({
    description: 'The content of the message',
    example: 'Hello, world!',
  })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({
    description: 'The Date of the message',
    example: '2024-08-26T19:01:48.489Z',
  })
  @IsDate()
  @IsNotEmpty()
  timestamp: Date;
}
