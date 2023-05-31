import { Inject } from '@nestjs/common';
import {
  OnQueueCompleted,
  OnQueueError,
  Process,
  Processor,
} from '@nestjs/bull';
import { MaterializedViewService } from './materialized-view.service';
import { LoggerService } from '../logger/logger.service';
import { MaterializedViewDefinition } from '@/core/materialized-view';
import { Job } from 'bullmq';
import { BM_QUEUE_NAME } from '@/consts';

export type MaterializedViewJobData = {
  definition: MaterializedViewDefinition;
};

@Processor({ name: BM_QUEUE_NAME })
export class MaterializedViewJobProcessor {
  constructor(
    @Inject(MaterializedViewService)
    private readonly mvService: MaterializedViewService,
    @Inject(LoggerService) private readonly logger: LoggerService,
  ) {
    this.logger.setContext('MaterializedViewJobProcessor');
  }
  @OnQueueError()
  onFailed(error: Error): void {
    this.logger.error(`Job failed: ${error}`);
  }

  @OnQueueCompleted()
  onCompleted(): void {
    this.logger.log(`Job completed: Materialized view created`);
  }

  @Process('create')
  async process(job: Job<MaterializedViewJobData>): Promise<any> {
    const definition = job.data.definition;
    const materializedView = await this.mvService.createMaterializedView(
      definition,
    );
    return materializedView;
  }
}
