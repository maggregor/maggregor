import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { RequestModule } from './request/request.module';
import { ProxyModule } from './mongodb-proxy/proxy.module';

@Module({
  imports: [DatabaseModule, RequestModule, ProxyModule],
})
export class AppModule {}
