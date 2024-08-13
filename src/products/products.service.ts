import {
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductDto, QueryProductDto, UpdateProductDto } from './dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product } from './schemas/products.schema';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);

  constructor(
    @InjectModel(Product.name) private productModel: Model<Product>,
  ) {}

  async create(id: string, createProductDto: CreateProductDto) {
    try {
      await this.productModel.create({
        user: id,
        ...createProductDto,
      });

      return {
        data: {},
        message: 'Product successfully created',
        status: HttpStatus.CREATED,
      };
    } catch (err) {
      this.logger.error(err, 'POST PRODUCT -- SERVICE');
      throw new HttpException(
        'An error occurred while creating the product',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAll({
    search = null,
    type = null,
    page = 1,
    limit = 5,
  }: QueryProductDto) {
    try {
      const offset = limit * (page - 1);

      const filter = {
        ...(type && { type }),
        ...(search && {
          name: new RegExp(search, 'i'),
        }),
      };

      const products = await this.productModel
        .find(filter)
        .skip(offset)
        .limit(limit)
        .populate({ path: 'user', select: '-password' });

      return { data: products, status: HttpStatus.OK };
    } catch (err) {
      this.logger.error(err, 'GET ALL PRODUCTS -- SERVICE');
      throw new HttpException(
        'An error occurred trying to get all the products',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findOne(id: string) {
    try {
      const product = await this.productModel
        .findById(id)
        .populate({ path: 'user', select: '-password' });

      if (!product) {
        this.logger.error(
          `Product with ID ${id} not found`,
          'GET ONE PRODUCT -- SERVICE',
        );
        throw new NotFoundException('Product not found');
      }

      return { data: product, status: HttpStatus.OK };
    } catch (err) {
      this.logger.error(err, 'GET PRODUCT -- SERVICE');
      throw new HttpException(
        'An error occurred trying to get the product',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async update(id: string, updateProductDto: UpdateProductDto, userId: string) {
    const product = await this.productModel.findById(id);

    if (!product) {
      this.logger.error(
        `Product with ID ${id} not found`,
        'PATCH PRODUCT -- SERVICE',
      );
      throw new NotFoundException('Product not found');
    }

    if (String(product.user) !== userId) {
      this.logger.error(
        `User with ID ${userId} is unauthorized to modify product with ID ${id}`,
        'PATCH PRODUCT -- SERVICE',
      );
      throw new ForbiddenException('Unauthorized to modify this product');
    }

    try {
      const productUpdated = await this.productModel.findByIdAndUpdate(
        id,
        updateProductDto,
        { new: true },
      );

      return { data: productUpdated, status: HttpStatus.OK };
    } catch (err) {
      this.logger.error(err, 'PATCH PRODUCT -- SERVICE');
      throw new HttpException(
        'An error occurred while updating the product',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async remove(id: string) {
    const product = await this.productModel.findByIdAndDelete(id);

    if (!product) {
      this.logger.error(
        `Product with ID ${id} not found`,
        'GET ONE PRODUCT -- SERVICE',
      );
      throw new NotFoundException('Product not found');
    }

    return {
      data: {},
      message: 'Product successfully deleted',
      status: HttpStatus.OK,
    };
  }
}
