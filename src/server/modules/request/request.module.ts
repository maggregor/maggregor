import { Module } from '@nestjs/common';
import { RequestService } from './request.service';
import { Request, RequestSchema } from './request.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { DatabaseModule } from '../database/database.module';
import { LoggerModule } from '../logger/logger.module';
import { RequestController } from './request.controller';
import { StatsController } from './stats.controller';
import { MaterializedViewModule } from '../materialized-view/materialized-view.module';

@Module({
  imports: [
    LoggerModule,
    DatabaseModule,
    MaterializedViewModule,
    MongooseModule.forFeature([{ name: Request.name, schema: RequestSchema }]),
  ],
  providers: [RequestService],
  controllers: [RequestController, StatsController],
})
export class RequestModule {}
