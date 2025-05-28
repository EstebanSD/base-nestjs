import { ApiProperty, PartialType } from '@nestjs/swagger';
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
  @ApiProperty({
    description: 'The name or email of the User',
    example: 'UserName',
    required: false,
  })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  search: string;

  @ApiProperty({
    description: 'The role of the User',
    enum: ROLES,
    example: ROLES.CUSTOMER,
    required: false,
  })
  @IsEnum(ROLES)
  @IsNotEmpty()
  @IsOptional()
  role: ROLES;

  @ApiProperty({
    description: 'The status of the User',
    example: 'false',
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  deleted: boolean;
}
