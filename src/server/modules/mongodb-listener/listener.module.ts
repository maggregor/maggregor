import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongoDBListenerService } from './listener.service';
import { LoggerModule } from '@/server/modules/logger/logger.module';
@Module({
  imports: [ConfigModule, LoggerModule],
  controllers: [],
  providers: [MongoDBListenerService],
})
export class ListenerModule {}
