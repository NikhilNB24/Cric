import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const allowedOrigins = [
    'http://localhost:8081',
    'http://localhost:19006',
    ...(process.env.CORS_ORIGIN ?? '').split(','),
  ]
    .map((origin) => origin.trim())
    .filter((origin, index, origins) => origin && origins.indexOf(origin) === index);

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
}
void bootstrap();
