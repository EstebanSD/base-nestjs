import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto, QueryProductDto, UpdateProductDto } from './dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles, User } from 'src/common/decorators';
import { Authorized } from 'src/common/decorators/authorized.decorator';
import { IUser } from 'src/common/interfaces/user.interface';

@ApiBearerAuth()
@ApiTags('product')
@Authorized()
@Controller('product')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Roles('Admin')
  @Post()
  create(@User() user: IUser, @Body() createProductDto: CreateProductDto) {
    return this.productsService.create(user, createProductDto);
  }

  @Get()
  findAll(@Query() query: QueryProductDto) {
    return this.productsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Patch(':id')
  update(
    @User('id') userId: string,
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.productsService.update(id, updateProductDto, userId);
  }

  @Delete(':id')
  remove(@User() user: IUser, @Param('id') id: string) {
    return this.productsService.remove(user, id);
  }
}
