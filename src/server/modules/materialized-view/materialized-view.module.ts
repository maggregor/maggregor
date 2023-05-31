import { BullModule } from '@nestjs/bull';
import { Global, Module } from '@nestjs/common';
import { LoggerModule } from '../logger/logger.module';
import { MaterializedViewService } from './materialized-view.service';
import { MaterializedViewJobProcessor } from './materialized-view.processor';
import { BM_QUEUE_NAME } from '@/consts';

@Global()
@Module({
  imports: [
    LoggerModule,
    BullModule.registerQueue({
      name: BM_QUEUE_NAME,
    }),
  ],
  providers: [MaterializedViewService, MaterializedViewJobProcessor],
  exports: [MaterializedViewService],
})
export class MaterializedViewModule {}
