import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { ChangePasswordDto, QueryUserDto, UpdateUserDto } from './dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { User } from 'src/common/decorators';
import { Authorized } from 'src/common/decorators/authorized.decorator';

@ApiBearerAuth()
@ApiTags('users')
@Authorized()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll(@Query() query: QueryUserDto) {
    return this.usersService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch()
  update(@User('id') userId: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(userId, updateUserDto);
  }

  @Delete()
  remove(@User('id') userId: string) {
    return this.usersService.remove(userId);
  }

  @Patch('change-password')
  changePassword(@User('id') userId: string, @Body() body: ChangePasswordDto) {
    return this.usersService.changePassword(userId, body);
  }
}
