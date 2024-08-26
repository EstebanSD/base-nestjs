import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class JoinRoomDto {
  @ApiProperty({
    description: 'The ID of the user',
    example: 'user123',
  })
  @IsString()
  @IsNotEmpty()
  userBId: string;
}
