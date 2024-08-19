import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MaxLength, MinLength } from 'class-validator';

export class LoginAuthDto {
  @ApiProperty({
    description: 'The email of the User',
    example: 'example@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'The password of the User',
    minimum: 8,
    maximum: 12,
  })
  @MinLength(8)
  @MaxLength(12)
  @IsNotEmpty()
  password: string;
}
