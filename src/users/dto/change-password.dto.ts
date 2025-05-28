import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({
    description: 'The current password',
    minimum: 8,
    maximum: 12,
  })
  @IsString()
  @MinLength(8)
  @MaxLength(12)
  @IsNotEmpty()
  oldPassword: string;

  @ApiProperty({
    description: 'The new password',
    minimum: 8,
    maximum: 12,
  })
  @IsString()
  @MinLength(8)
  @MaxLength(12)
  @IsNotEmpty()
  newPassword: string;
}
