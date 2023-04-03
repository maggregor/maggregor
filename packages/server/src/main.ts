import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app.module';

export async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(
    process.env.HTTP_PORT || 3000,
    process.env.HTTP_HOST || 'localhost',
  );
}
bootstrap();
