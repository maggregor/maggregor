import { Module } from '@nestjs/common';
import { RequestService } from './request.service';
import { RequestController } from './request.controller';

@Module({
  providers: [RequestService],
  controllers: [RequestController],
})
export class RequestModule {}
