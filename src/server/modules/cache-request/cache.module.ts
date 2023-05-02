import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CacheService } from './cache.service';
import { LoggerModule } from '../logger/logger.module';

@Module({
  imports: [LoggerModule, ConfigModule],
  providers: [CacheService],
})
export class CacheModule {}
