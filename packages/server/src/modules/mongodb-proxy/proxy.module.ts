import { Module } from '@nestjs/common';

import { MongoDBTcpProxyService } from './proxy.service';

@Module({
  imports: [],
  controllers: [],
  providers: [MongoDBTcpProxyService],
})
export class ProxyModule {}
