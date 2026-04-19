import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app/app.module';
import { AuthService } from './auth/auth.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api/v1');

  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, transform: true }),
  );

  app.enableCors({
    origin: [
      'http://localhost:4200',
      process.env['FRONTEND_URL'] ?? 'http://localhost:4200',
    ],
    credentials: true,
  });

  // Health check for Railway / uptime monitors
  const httpAdapter = app.getHttpAdapter();
  httpAdapter.get('/api/v1/health', (_req: unknown, res: { json: (o: unknown) => void }) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  const swaggerConfig = new DocumentBuilder()
    .setTitle('ZBURLIUC Sliding Doors API')
    .setDescription('REST API for the sliding doors configurator platform')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  const authService = app.get(AuthService);
  await authService.seedAdmin(
    process.env['ADMIN_EMAIL'] ?? 'admin@zburliuc.com',
    process.env['ADMIN_PASSWORD'] ?? 'admin123',
    'Administrator',
  );

  const port = process.env['PORT'] ?? 3000;
  await app.listen(port);
  Logger.log(
    `API running at http://localhost:${port}/api/v1`,
    'Bootstrap',
  );
  Logger.log(
    `Swagger docs at http://localhost:${port}/api/docs`,
    'Bootstrap',
  );
}

bootstrap();
