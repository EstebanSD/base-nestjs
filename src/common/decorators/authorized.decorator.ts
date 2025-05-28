import { applyDecorators, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { DeletedGuard } from '../guards';

export const Authorized = () => {
  return applyDecorators(UseGuards(JwtAuthGuard, DeletedGuard));
};
