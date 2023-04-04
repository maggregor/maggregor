import { Module } from '@nestjs/common';
import { MaterializedViewController } from './materialized-view.controller';
import { MaterializedViewService } from './materialized-view.service';

@Module({
  controllers: [MaterializedViewController],
  providers: [MaterializedViewService],
})
export class MaterializedViewModule {}
