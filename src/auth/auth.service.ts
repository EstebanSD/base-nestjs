import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/users/schemas/users.schema';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { RegisterAuthDto } from './dto/register-auth.dto';
import { LoginAuthDto } from './dto/login-auth.dto';
import * as bcrypt from 'bcrypt';
import { ROLES } from 'src/common/constants';
import { JwtService } from '@nestjs/jwt';

const SALT_OR_ROUNDS = 10;
type Role = (typeof ROLES)[keyof typeof ROLES];

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async register(userObject: RegisterAuthDto) {
    const { password, role } = userObject;
    const toHash = await bcrypt.hash(password, SALT_OR_ROUNDS);

    userObject = { ...userObject, password: toHash };

    const validRole = Object.values(ROLES).includes(role as Role);
    if (!validRole) {
      throw new HttpException('INVALID_ROL', HttpStatus.BAD_REQUEST);
    }

    return this.userModel.create(userObject).catch((err) => {
      if (err.code === 11000) {
        throw new HttpException(
          'THIS_EMAIL_ALREADY_EXISTS',
          HttpStatus.NOT_ACCEPTABLE,
        );
      } else {
        throw new HttpException(
          'AN_ERROR_OCCURRED',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    });
  }

  async login(userObject: LoginAuthDto) {
    const { email, password } = userObject;
    const findUser = await this.userModel.findOne({ email });

    if (!findUser)
      throw new HttpException('USER_NOT_FOUND', HttpStatus.NOT_FOUND);

    const checkPassword = await bcrypt.compare(password, findUser.password);
    if (!checkPassword)
      throw new HttpException('PASSWORD_INCORRECT', HttpStatus.FORBIDDEN);

    const token = this.jwtService.sign({
      id: findUser._id,
      email: findUser.email,
      role: findUser.role,
    });

    const data = {
      user: {
        _id: findUser._id,
        name: findUser.name,
        email: findUser.email,
        role: findUser.role,
      },
      token,
    };
    return data;
  }
}
