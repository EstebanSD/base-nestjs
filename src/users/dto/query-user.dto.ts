import { PartialType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { ROLES } from 'src/common/constants';
import { PaginationDto } from 'src/common/dto';

export class QueryUserDto extends PartialType(PaginationDto) {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  search: string;

  @IsEnum(ROLES)
  @IsNotEmpty()
  @IsOptional()
  role: ROLES;

  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  deleted: boolean;
}
