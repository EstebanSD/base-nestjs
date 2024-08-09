import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  //   constructor(@InjectModel(User.name) private userModel: Model<User>) {
  //     super();
  //   }
  //   async canActivate(context: ExecutionContext): Promise<boolean> {
  //     const request = context.switchToHttp().getRequest();
  //     const user = request.user;
  //     if (user?.id) {
  //       const { deleted } = await this.userModel.findById(user.id).lean();
  //       console.log(deleted);
  //       return !deleted;
  //     }
  //     throw new ForbiddenException('Your account is deleted');
  //   }
}
