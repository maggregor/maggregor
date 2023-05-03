import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ListenerService } from './listener.service';
import { LoggerModule } from '@/server/modules/logger/logger.module';
@Global()
@Module({
  imports: [ConfigModule, LoggerModule],
  providers: [ListenerService],
  exports: [ListenerService],
})
export class ListenerModule {}
