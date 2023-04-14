import { NestFactory } from '@nestjs/core';
import { AppModule } from './server/modules/app.module';
import { Logger } from '@nestjs/common';

export async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error'],
  });
  Logger.log('Starting Maggregor...');
  await app.listen(
    process.env.HTTP_PORT || 3000,
    process.env.HTTP_HOST || 'localhost',
  );
  Logger.log('Maggregor is running. Waiting for connections...');
}
bootstrap();
