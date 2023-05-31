import { Module, Global } from '@nestjs/common';
import { CacheService } from './cache.service';
import { LoggerModule } from '../logger/logger.module';

@Global()
@Module({
  imports: [LoggerModule],
  providers: [CacheService],
  exports: [CacheService],
})
export class CacheModule {}
