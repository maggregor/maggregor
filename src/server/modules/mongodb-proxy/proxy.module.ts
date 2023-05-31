import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoDBTcpProxyService } from './proxy.service';
import { RequestModule } from '../request/request.module';
import { RequestService } from '../request/request.service';
import { Request, RequestSchema } from '../request/request.schema';
import { DatabaseModule } from '../database/database.module';
import { LoggerService } from '@/server/modules/logger/logger.service';
import { LoggerModule } from '../logger/logger.module';
import { MaterializedViewModule } from '../materialized-view/materialized-view.module';

@Module({
  imports: [
    LoggerModule,
    DatabaseModule,
    RequestModule,
    MaterializedViewModule,
    MongooseModule.forFeature([{ name: Request.name, schema: RequestSchema }]),
  ],
  controllers: [],
  providers: [LoggerService, MongoDBTcpProxyService, RequestService],
})
export class ProxyModule {}
