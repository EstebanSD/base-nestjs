import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/users/schemas/users.schema';
import {
  ForbiddenException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotAcceptableException,
  NotFoundException,
} from '@nestjs/common';
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
        throw new NotAcceptableException('This email already exists');
      } else {
        this.logger.error(err, 'POST AUTH -- SERVICE');
        throw new InternalServerErrorException(
          'An error occurred while creating the account',
        );
      }
    }
  }

  async login(userObject: LoginAuthDto) {
    const { email, password } = userObject;
    const findUser = await this.userModel.findOne({ email });

    if (!findUser) {
      this.logger.error(`User not found`, 'POST AUTH -- SERVICE');
      throw new NotFoundException('User not found');
    }

    const checkPassword = await bcrypt.compare(password, findUser.password);
    if (!checkPassword) {
      this.logger.error(`Incorrect password`, 'POST AUTH -- SERVICE');
      throw new ForbiddenException('Incorrect password');
    }

    try {
      const token = this.jwtService.sign({
        id: findUser._id,
        name: findUser.name,
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
      throw new InternalServerErrorException(
        'An error has occurred during the account sign-in process',
      );
    }
  }

  async getUserFromAuthenticationToken(token: string) {
    try {
      const payload = this.jwtService.verify(token, {
        secret: this.configService.get('jwt.secret'),
      });

      if (payload?.id) {
        return this.userModel.findById(payload.id).select('id');
      }
      return null;
    } catch (err) {
      this.logger.error(err, 'AUTH -- SERVICE');
      throw new InternalServerErrorException(
        'An error has occurred trying to authenticate the user',
      );
    }
  }
}
