import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

// Support BigInt serialization in JSON responses
(BigInt.prototype as any).toJSON = function () {
  return Number(this) <= Number.MAX_SAFE_INTEGER ? Number(this) : this.toString();
};

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api/v1');
  app.enableCors();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  );
  const port = process.env.PORT || 4000;
  await app.listen(port);
  console.log(`🚀 Zerify Backend API is running on http://localhost:${port}/api/v1`);
}

bootstrap();
