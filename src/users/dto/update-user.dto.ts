import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({
    description: 'The name of the User',
    example: 'Agus el sopla quena', // TODO
    required: false,
  })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  name: string;

  @ApiProperty({
    description: 'The email of the User',
    example: 'example@example.com',
    required: false,
  })
  @IsEmail()
  @IsOptional()
  email: string;
}
