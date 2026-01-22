import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      stopAtFirstError: true,
      exceptionFactory: (errors) => {
        const messages = errors.map((error) => {
          return Object.values(error.constraints || {}).join(', ');
        });
        return new BadRequestException(messages.join('; '));
      },
    }),
  );
  app.useGlobalInterceptors(new TransformInterceptor(new Reflector()));
  app.useGlobalFilters(new HttpExceptionFilter());
  const config = new DocumentBuilder()
    .setTitle('Proyecto Agro API')
    .setDescription('API endpoints for user auth, cow management, and synchronization.')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'Proyecto Agro API Docs',
    customfavIcon: 'https://unpkg.com/swagger-ui-dist/favicon-16x16.png',
    customJs: [
      'https://unpkg.com/swagger-ui-dist/swagger-ui-bundle.js',
      'https://unpkg.com/swagger-ui-dist/swagger-ui-standalone-preset.js',
    ],
    customCssUrl: 'https://unpkg.com/swagger-ui-dist/swagger-ui.css',
    swaggerOptions: {
      persistAuthorization: true,
    },
  });
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
