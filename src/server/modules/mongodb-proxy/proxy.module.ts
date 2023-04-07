import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoDBTcpProxyService } from './proxy.service';
import { RequestModule } from '../request/request.module';
import { RequestService } from '../request/request.service';
import { Request, RequestSchema } from '../request/request.schema';
import { DatabaseModule } from '../database/database.module';
import { ConfigModule } from '@nestjs/config';
@Module({
  imports: [
    ConfigModule,
    DatabaseModule,
    RequestModule,
    MongooseModule.forFeature([{ name: Request.name, schema: RequestSchema }]),
  ],
  controllers: [],
  providers: [MongoDBTcpProxyService, RequestService],
})
export class ProxyModule {}
