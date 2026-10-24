import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule, {
    cors: {
      origin: [
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        process.env.CORS_ORIGIN || 'http://localhost:3000',
      ],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    },
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Global prefix
  const apiPrefix = process.env.API_PREFIX || 'api';
  app.setGlobalPrefix(apiPrefix);

  // Swagger / OpenAPI specification
  const config = new DocumentBuilder()
    .setTitle('College Admission Management System API')
    .setDescription(
      'Enterprise-grade REST API for admissions workflow: authentication, student registry, quota allocation, document verification, payments and audit.',
    )
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Enter your JWT access token',
        in: 'header',
      },
      'bearer',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(`${apiPrefix}/docs`, app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
    customSiteTitle: 'Admission System API Docs',
  });

  const port = parseInt(process.env.PORT || '4000', 10);
  await app.listen(port);

  logger.log(`🚀 API Server running on: http://localhost:${port}/${apiPrefix}`);
  logger.log(`📚 OpenAPI Docs available at: http://localhost:${port}/${apiPrefix}/docs`);
}

bootstrap();
