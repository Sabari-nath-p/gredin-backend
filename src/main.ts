import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');

  // Enable CORS for HTTP and WebSockets
  // - If FRONTEND_URL is set, you can provide a comma-separated allowlist
  // - Otherwise, reflect request origin (useful behind a reverse proxy)
  const allowedOrigins = process.env.FRONTEND_URL
    ? process.env.FRONTEND_URL.split(',').map((s) => s.trim()).filter(Boolean)
    : true;

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  });

  // Enable WebSockets with CORS
  app.useWebSocketAdapter(new IoAdapter(app));

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('MyTrade API')
    .setDescription('MyTrade Backend API - Email/OTP Authentication & Google OAuth')
    .setVersion('1.0')
    .addTag('Authentication', 'Email OTP and Google OAuth endpoints')
    .addTag('Users', 'User profile management endpoints')
    .addTag('Trade Accounts', 'Trading account management endpoints')
    .addTag('Trade Entries', 'Trade entry and position management endpoints')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter JWT token',
      },
      'JWT-auth',
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
  });

  await app.listen(process.env.PORT ?? 3000);
  console.log(`Application is running on: http://localhost:${process.env.PORT ?? 3000}`);
  console.log(`Swagger docs available at: http://localhost:${process.env.PORT ?? 3000}/api/docs`);
}
bootstrap();

