import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  const config = new DocumentBuilder()
    .addBearerAuth()
    .setTitle('Api Documentation')
    .setDescription('The base nestjs API description')
    .setVersion('1.0')
    .addTag('auth')
    .addTag('users')
    .addTag('products')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  app.useGlobalPipes(new ValidationPipe());

  const port = configService.get<number>('port');
  const clientUrl = configService.get<string>('client');

  app.enableCors({
    origin: clientUrl,
    allowedHeaders: 'Content-Type, Authorization',
    credentials: true,
  });

  await app.listen(port);
}
bootstrap();
