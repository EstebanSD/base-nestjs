import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/users/schemas/users.schema';
import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { RegisterAuthDto } from './dto/register-auth.dto';
import { LoginAuthDto } from './dto/login-auth.dto';
import * as bcrypt from 'bcrypt';
import { FILE_DIRECTORY, SALT_OR_ROUNDS } from 'src/common/constants';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    private jwtService: JwtService,
    @InjectModel(User.name) private userModel: Model<User>,
    private readonly configService: ConfigService,
  ) {}

  async register(userObject: RegisterAuthDto) {
    try {
      const { password } = userObject;
      const toHash = await bcrypt.hash(password, SALT_OR_ROUNDS);

      userObject = { ...userObject, password: toHash };

      await this.userModel.create(userObject);

      return {
        message: 'Account successfully created',
        status: HttpStatus.CREATED,
      };
    } catch (err) {
      if (err.code === 11000) {
        this.logger.error(err, 'POST AUTH -- SERVICE');
        throw new HttpException(
          'This email already exists',
          HttpStatus.NOT_ACCEPTABLE,
        );
      } else {
        this.logger.error(err, 'POST AUTH -- SERVICE');
        throw new HttpException(
          'An error occurred while creating the account',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  async login(userObject: LoginAuthDto) {
    try {
      const { email, password } = userObject;
      const findUser = await this.userModel.findOne({ email });

      if (!findUser)
        throw new HttpException('USER_NOT_FOUND', HttpStatus.NOT_FOUND);

      const checkPassword = await bcrypt.compare(password, findUser.password);
      if (!checkPassword)
        throw new HttpException('INCORRECT_PASSWORD', HttpStatus.FORBIDDEN);

      const token = this.jwtService.sign({
        id: findUser._id,
        email: findUser.email,
        role: findUser.role,
      });

      const host = this.configService.get<string>('baseUrl');
      const user = Object.fromEntries(
        Object.entries(findUser.toObject())
          .filter(([key]) => key !== 'password')
          .map(([key, value]) => [
            key,
            key === 'picture' && value
              ? `${host}/${FILE_DIRECTORY}/${value}`
              : value,
          ]),
      );

      return { user, token };
    } catch (err) {
      this.logger.error(err, 'POST AUTH -- SERVICE');
      throw new HttpException(
        'An error has occurred during the account sign-in process',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
