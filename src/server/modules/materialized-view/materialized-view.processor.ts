import { Inject } from '@nestjs/common';
import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { MaterializedViewService } from './materialized-view.service';
import { LoggerService } from '../logger/logger.service';
import { MaterializedViewDefinition } from '@/core/materialized-view';
import { Job } from 'bullmq';
import { BM_QUEUE_NAME } from '@/consts';

export type MaterializedViewJobData = {
  definition: MaterializedViewDefinition;
};

@Processor(
  { name: BM_QUEUE_NAME },
  { concurrency: 4, limiter: { max: 1, duration: 10000 } },
)
export class MaterializedViewJobProcessor extends WorkerHost {
  constructor(
    @Inject(MaterializedViewService)
    private readonly mvService: MaterializedViewService,
    @Inject(LoggerService) private readonly logger: LoggerService,
  ) {
    super();
    this.logger.setContext('MaterializedViewJobProcessor');
  }
  @OnWorkerEvent('failed')
  onFailed(job: Job, error: Error): void {
    this.logger.error(`Job failed: ${error}`);
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job): void {
    this.logger.log(`Job ${job.id} completed: Materialized view created`);
  }

  async process(job: Job<MaterializedViewJobData>): Promise<any> {
    try {
      const definition = job.data.definition;
      const materializedView = await this.mvService.createMaterializedView(
        definition,
      );
      return materializedView;
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }
}
