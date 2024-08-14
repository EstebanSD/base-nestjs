import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { PRODUCT_TYPES } from 'src/common/constants';
import { PaginationDto } from 'src/common/dto';

export class QueryProductDto extends PartialType(PaginationDto) {
  @ApiProperty({
    description: 'The name of the product',
    example: 'Example Product',
    required: false,
  })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  search: string;

  @ApiProperty({
    description: 'The name of the product',
    enum: PRODUCT_TYPES,
    example: PRODUCT_TYPES.TECHNOLOGY,
    required: false,
  })
  @IsEnum(PRODUCT_TYPES)
  @IsNotEmpty()
  @IsOptional()
  type: PRODUCT_TYPES;
}
