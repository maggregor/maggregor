import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoDBTcpProxyService } from './proxy.service';
import { RequestModule } from '../request/request.module';
import { RequestService } from '../request/request.service';
import { Request, RequestSchema } from '../request/request.schema';
import { DatabaseModule } from '../database/database.module';
import { ConfigModule } from '@nestjs/config';
import { LoggerService } from '@/server/modules/logger/logger.service';
import { LoggerModule } from '../logger/logger.module';
import { MaterializedViewService } from '../materialized-view/materialized-view.service';
@Module({
  imports: [
    LoggerModule,
    ConfigModule,
    DatabaseModule,
    RequestModule,
    MongooseModule.forFeature([{ name: Request.name, schema: RequestSchema }]),
  ],
  controllers: [],
  providers: [
    LoggerService,
    MongoDBTcpProxyService,
    RequestService,
    MaterializedViewService,
  ],
})
export class ProxyModule {}
