import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles, User } from 'src/common/decorators';
import { Authorized } from 'src/common/decorators/authorized.decorator';

@ApiBearerAuth()
@ApiTags('product')
@Authorized()
@Controller('product')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Roles('Admin')
  @Post()
  create(@User('id') id: string, @Body() createProductDto: CreateProductDto) {
    return this.productsService.create(id, createProductDto);
  }

  @Get()
  findAll() {
    return this.productsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(+id, updateProductDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productsService.remove(+id);
  }
}
