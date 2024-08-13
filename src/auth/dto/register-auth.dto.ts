import { PartialType } from '@nestjs/swagger';
import { LoginAuthDto } from './login-auth.dto';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { ROLES } from 'src/common/constants';

export class RegisterAuthDto extends PartialType(LoginAuthDto) {
  @IsNotEmpty()
  name: string;

  @IsEnum(ROLES)
  @IsNotEmpty()
  role: ROLES;
}
