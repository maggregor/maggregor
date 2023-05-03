import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CacheService } from './cache.service';
import { LoggerModule } from '../logger/logger.module';

@Global()
@Module({
  imports: [LoggerModule, ConfigModule],
  providers: [CacheService],
  exports: [CacheService],
})
export class CacheModule {}
