import {
  ForbiddenException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotAcceptableException,
  NotFoundException,
} from '@nestjs/common';
import { UpdateUserDto, QueryUserDto, ChangePasswordDto } from './dto';
import { Model } from 'mongoose';
import { User } from './schemas/users.schema';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { FILE_DIRECTORY, SALT_OR_ROUNDS } from 'src/common/constants';
import * as fs from 'fs';
import * as path from 'path';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private readonly configService: ConfigService,
  ) {}

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

      // ADD PICTURE
      users.forEach((user) => {
        if (user.picture) {
          const host = this.configService.get<string>('baseUrl');
          user.picture = `${host}/${FILE_DIRECTORY}/${user.picture}`;
        }
        return user;
      });

      return { data: users, status: HttpStatus.OK };
    } catch (err) {
      this.logger.error(err, 'GET USERS -- SERVICE');
      throw new InternalServerErrorException(
        'An error ocurred trying to get all the users',
      );
    }
  }

  async findOne(id: string) {
    try {
      const user = await this.userModel.findById(id).select('-password');

      if (!user) {
        this.logger.error(
          `User with ID ${id} not found`,
          'GET ONE USER -- SERVICE',
        );
        throw new NotFoundException('User not found');
      }

      // ADD PICTURE
      if (user.picture) {
        const host = this.configService.get<string>('client');
        user.picture = `${host}/${FILE_DIRECTORY}/${user.picture}`;
      }

      return { data: user, status: HttpStatus.OK };
    } catch (err) {
      if (err instanceof NotFoundException) {
        throw err;
      }

      this.logger.error(err, 'GET USER -- SERVICE');
      throw new InternalServerErrorException(
        'An error occurred trying to get the user',
      );
    }
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
      if (err instanceof NotFoundException) {
        throw err;
      }

      if (err.code === 11000) {
        this.logger.error(err, 'UPDATE USER -- SERVICE');
        throw new NotAcceptableException('This email already exists');
      } else {
        this.logger.error(err, 'UPDATE USER -- SERVICE');
        throw new InternalServerErrorException(
          'An error occurred trying to update the current user',
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
      if (err instanceof NotFoundException) {
        throw err;
      }

      this.logger.error(err.message, 'DELETE USER -- SERVICE');
      throw new InternalServerErrorException(
        'An error occurred while deleting the user',
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
    if (!checkPassword) {
      this.logger.error(
        'Incorrect password',
        'CHANGE PASSWORD USER -- SERVICE',
      );
      throw new ForbiddenException('Incorrect password');
    }

    const hashedPassword = await bcrypt.hash(newPassword, SALT_OR_ROUNDS);

    try {
      const user = await this.userModel
        .findByIdAndUpdate(id, { password: hashedPassword }, { new: true })
        .select('-password');

      return { data: user, status: HttpStatus.OK };
    } catch (err) {
      this.logger.error(err, 'CHANGE PASSWORD USER -- SERVICE');
      throw new InternalServerErrorException('Error updating user password');
    }
  }

  async changePicture(userId: string, fileName: string) {
    try {
      const user = await this.userModel.findById(userId);

      if (user.picture) {
        const files = fs.readdirSync(`./${FILE_DIRECTORY}`);

        files.forEach((existingFile) => {
          const existingFilePath = path.join(
            `./${FILE_DIRECTORY}`,
            existingFile,
          );
          if (
            fs.existsSync(existingFilePath) &&
            existingFile === user.picture
          ) {
            fs.unlinkSync(existingFilePath);
          }
        });
      }

      await this.userModel.findByIdAndUpdate(userId, {
        picture: fileName,
      });

      return {
        message: 'File successfully uploaded',
        fileName,
        status: HttpStatus.OK,
      };
    } catch (err) {
      this.logger.error(err, 'CHANGE PICTURE USER -- SERVICE');
      throw new InternalServerErrorException(
        'Error uploading the user picture',
      );
    }
  }
}
