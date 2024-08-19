import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { PRODUCT_TYPES } from 'src/common/constants';

export class CreateProductDto {
  @ApiProperty({
    description: 'The name of the product',
    example: 'Example Product',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'The type of the product',
    example: PRODUCT_TYPES.TECHNOLOGY,
    enum: PRODUCT_TYPES,
  })
  @IsEnum(PRODUCT_TYPES)
  @IsNotEmpty()
  type: PRODUCT_TYPES;
}
