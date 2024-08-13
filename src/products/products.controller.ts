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

@ApiBearerAuth()
@ApiTags('products')
@Authorized()
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Roles('Admin')
  @Post()
  create(@User('id') id: string, @Body() createProductDto: CreateProductDto) {
    return this.productsService.create(id, createProductDto);
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
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }
}
