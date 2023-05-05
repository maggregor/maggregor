import { Module } from '@nestjs/common';
import { MaterializedViewService } from './materialized-view.service';
import { LoggerModule } from '../logger/logger.module';

@Module({
  imports: [LoggerModule],
  providers: [MaterializedViewService],
})
export class MaterializedViewModule {}
