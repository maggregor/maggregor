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

@Processor({ name: BM_QUEUE_NAME })
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
  onFailed(job: Job<MaterializedViewJobData>): void {
    this.logger.error(`Job ${job.id} failed: ${job.failedReason}`);
  }

  @OnWorkerEvent('ready')
  onReady(): void {
    this.logger.log(`Ready to process a new create materialized view job...`);
  }

  @OnWorkerEvent('completed')
  onCompleted(): void {
    this.logger.log(`Job completed: Materialized view created`);
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
