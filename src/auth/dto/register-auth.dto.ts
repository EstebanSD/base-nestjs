import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ROLES } from 'src/common/constants';

export class RegisterAuthDto {
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

  @ApiProperty({
    description: 'The name of the User',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'The role of the User',
    example: ROLES.CUSTOMER,
    enum: ROLES,
  })
  @IsEnum(ROLES)
  @IsNotEmpty()
  role: ROLES;
}
