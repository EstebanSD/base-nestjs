import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { PRODUCT_TYPES } from 'src/common/constants';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(PRODUCT_TYPES)
  @IsNotEmpty()
  type: PRODUCT_TYPES;
}
