import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { json, urlencoded } from 'express';
import { AppModule } from './app.module';

// Support BigInt serialization in JSON responses
(BigInt.prototype as any).toJSON = function () {
  return Number(this) <= Number.MAX_SAFE_INTEGER ? Number(this) : this.toString();
};

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Raw-body capture: webhook signature verification (TRD §43) must see the
  // exact bytes the provider signed, so JSON bodies are preserved verbatim
  // alongside the parsed object.
  app.use(
    json({
      verify: (req: any, _res, buf) => {
        if (Buffer.isBuffer(buf)) {
          req.rawBody = buf;
        }
      },
    }),
  );
  app.use(urlencoded({ extended: true }));

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
  new Logger('Bootstrap').log(
    `Zerify Backend API is running on http://localhost:${port}/api/v1`,
  );
}

bootstrap();
