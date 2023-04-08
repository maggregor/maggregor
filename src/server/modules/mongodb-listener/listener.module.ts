import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongoDBListenerService } from './listener.service';
@Module({
  imports: [ConfigModule],
  controllers: [],
  providers: [MongoDBListenerService],
})
export class ListenerModule {}
