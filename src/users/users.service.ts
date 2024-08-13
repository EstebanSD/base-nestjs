import {
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { UpdateUserDto, QueryUserDto, ChangePasswordDto } from './dto';
import { Model } from 'mongoose';
import { User } from './schemas/users.schema';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { SALT_OR_ROUNDS } from 'src/common/constants';

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

      const users = await this.userModel
        .find(filter)
        .skip(offset)
        .limit(limit)
        .select('-password');

      return { data: users, status: HttpStatus.OK };
    } catch (err) {
      this.logger.error(err, 'GET USERS -- SERVICE');
      throw new HttpException(err.message, err.status);
    }
  }

  async findOne(id: string) {
    const user = await this.userModel.findById(id).select('-password');

    if (!user) {
      this.logger.error(
        `User with ID ${id} not found`,
        'GET ONE USER -- SERVICE',
      );
      throw new NotFoundException('User not found');
    }

    return { data: user, status: HttpStatus.OK };
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    // TODO {email ? verification() : false}
    try {
      const user = await this.userModel
        .findByIdAndUpdate(id, updateUserDto, { new: true })
        .select('-password');

      if (!user) {
        throw new NotFoundException('User not found');
      }

      return { data: user, status: HttpStatus.OK };
    } catch (err) {
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
    }
  }

  async remove(id: string) {
    try {
      const user = await this.userModel.findByIdAndUpdate(
        id,
        { deleted: true },
        { new: true },
      );
      if (!user) {
        this.logger.error(
          `User with ID ${id} not found`,
          'DELETE USER -- SERVICE',
        );
        throw new NotFoundException('User not found');
      }
      return {
        data: {},
        message: 'User successfully deleted',
        status: HttpStatus.OK,
      };
    } catch (err) {
      this.logger.error(err.message, 'DELETE USER -- SERVICE');
      throw new HttpException(
        'An error occurred while deleting the user',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async changePassword(
    id: string,
    { oldPassword, newPassword }: ChangePasswordDto,
  ) {
    const user = await this.userModel.findById(id);
    if (!user) {
      this.logger.error(
        `User with ID ${id} not found`,
        'CHANGE PASSWORD USER -- SERVICE',
      );
      throw new NotFoundException('User not found');
    }

    const checkPassword = await bcrypt.compare(oldPassword, user.password);
    if (!checkPassword)
      throw new HttpException('INCORRECT_PASSWORD', HttpStatus.FORBIDDEN);

    const hashedPassword = await bcrypt.hash(newPassword, SALT_OR_ROUNDS);

    try {
      const user = await this.userModel
        .findByIdAndUpdate(id, { password: hashedPassword }, { new: true })
        .select('-password');

      return { data: user, status: HttpStatus.OK };
    } catch (err) {
      this.logger.error(err, 'CHANGE PASSWORD USER -- SERVICE');
      throw new HttpException(
        'Error updating user password',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
