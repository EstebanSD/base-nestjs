import {
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { UpdateUserDto, QueryUserDto } from './dto';
import { Model } from 'mongoose';
import { User } from './schemas/users.schema';
import { InjectModel } from '@nestjs/mongoose';
import { CreateProductDto } from 'src/products/dto/create-product.dto';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async findAll({
    deleted = false,
    search = null,
    role = null,
    page = 1,
    limit = 5,
  }: QueryUserDto) {
    try {
      const offset = limit * (page - 1);

      const filter = {
        deleted,
        ...(role && { role }),
        ...(search && {
            name: new RegExp(search, 'i'),
          } && {
            email: new RegExp(search, 'i'),
          }),
      };

      return await this.userModel
        .find(filter)
        .skip(offset)
        .limit(limit)
        .select('-password');
    } catch (err) {
      this.logger.error(err, 'GET USERS -- SERVICE');
      throw new HttpException(err.message, err.status);
    }
  }

  async findOne(id: string) {
    const user = await this.userModel
      .findById(id)
      .select('-password')
      .catch((err) => {
        this.logger.error(err, 'GET ONE USER -- SERVICE');
        throw new NotFoundException('User not found');
      });

    return { user };
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    return this.userModel
      .findByIdAndUpdate(id, updateUserDto, { new: true })
      .select('-password')
      .catch((err) => {
        if (err.code === 11000) {
          this.logger.error(err, 'UPDATE USER -- SERVICE');
          throw new HttpException(
            'THIS_EMAIL_ALREADY_EXISTS',
            HttpStatus.NOT_ACCEPTABLE,
          );
        } else {
          this.logger.error(err, 'UPDATE USER -- SERVICE');
          throw new HttpException(
            'AN_ERROR_OCCURRED',
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }
      });
  }

  async remove(id: string) {
    return this.userModel
      .findByIdAndUpdate(id, { deleted: true })
      .catch((err) => {
        this.logger.error(err, 'DELETE USER -- SERVICE');
        throw new HttpException(err.message, err.status);
      });
  }

  /// PRODUCT ///

  async createProduct(id: string, createProductDto: CreateProductDto) {
    console.log(id, createProductDto);
  }
}
