import { Module } from '@nestjs/common';
import { RequestService } from './request.service';
import { Request, RequestSchema } from './request.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { DatabaseModule } from '../database/database.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule,
    DatabaseModule,
    MongooseModule.forFeature([{ name: Request.name, schema: RequestSchema }]),
  ],
  providers: [RequestService],
  controllers: [],
})
export class RequestModule {}
