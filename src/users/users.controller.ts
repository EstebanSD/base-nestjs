import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { ChangePasswordDto, QueryUserDto, UpdateUserDto } from './dto';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { User } from 'src/common/decorators';
import { Authorized } from 'src/common/decorators/authorized.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { FILE_DIRECTORY } from 'src/common/constants';

@ApiBearerAuth()
@ApiTags('user')
@Authorized()
@Controller('user')
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

  @Patch('picture')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'File to upload',
    schema: {
      type: 'object',
      properties: {
        picture: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('picture', {
      storage: diskStorage({
        destination: `./${FILE_DIRECTORY}`,
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(
            null,
            `${file.fieldname}-${uniqueSuffix}${extname(file.originalname)}`,
          );
        },
      }),
    }),
  )
  changePicture(
    @User('id') userId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.usersService.changePicture(userId, file.filename);
  }
}
