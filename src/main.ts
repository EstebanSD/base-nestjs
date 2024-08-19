import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as express from 'express';
import { join } from 'path';
import { FILE_DIRECTORY } from './common/constants';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  const config = new DocumentBuilder()
    .addBearerAuth()
    .setTitle('Api Documentation')
    .setDescription('The base nestjs API description')
    .setVersion('1.0')
    .addTag('auth')
    .addTag('user')
    .addTag('product')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  app.useGlobalPipes(new ValidationPipe());

  const port = configService.get<number>('port');
  const clientUrl = configService.get<string>('client');

  app.enableCors({
    origin: clientUrl,
    methods: 'GET,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Authorization',
    credentials: true,
  });

  // Serve static files from folder /uploads
  app.use(
    `/${FILE_DIRECTORY}`,
    express.static(join(__dirname, '..', FILE_DIRECTORY)),
  );

  await app.listen(port);
}
bootstrap();
