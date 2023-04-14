import { Module } from '@nestjs/common';
import { MaterializedViewController } from './materialized-view.controller';
import { MaterializedViewService } from './materialized-view.service';
import { LoggerModule } from '../logger/logger.module';

@Module({
  imports: [LoggerModule],
  controllers: [MaterializedViewController],
  providers: [MaterializedViewService],
})
export class MaterializedViewModule {}
