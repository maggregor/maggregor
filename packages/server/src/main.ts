import { NestFactory } from '@nestjs/core';
import { ProxyModule } from './modules/mongodb-proxy/proxy.module';

async function bootstrap() {
  const app = await NestFactory.create(ProxyModule);
  await app.listen(3000);
}
bootstrap();
