import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { ROLES_KEY } from 'src/common/constants';
import { RolesGuard } from '../guards';

export const Roles = (roles: string | string[]) => {
  return applyDecorators(
    SetMetadata(ROLES_KEY, Array.isArray(roles) ? roles : [roles]),
    UseGuards(RolesGuard),
  );
};
