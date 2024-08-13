import { PartialType } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { PRODUCT_TYPES } from 'src/common/constants';
import { PaginationDto } from 'src/common/dto';

export class QueryProductDto extends PartialType(PaginationDto) {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  search: string;

  @IsEnum(PRODUCT_TYPES)
  @IsNotEmpty()
  @IsOptional()
  type: PRODUCT_TYPES;
}
