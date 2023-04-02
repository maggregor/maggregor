import { Module } from '@nestjs/common';
import { RequestService } from './request.service';
import { RequestController } from './request.controller';
import { Request, RequestSchema } from './request.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [
    DatabaseModule,
    MongooseModule.forFeature([{ name: Request.name, schema: RequestSchema }]),
  ],
  providers: [RequestService],
  controllers: [RequestController],
})
export class RequestModule {}
