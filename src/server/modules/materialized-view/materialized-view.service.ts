import { Inject, Injectable } from '@nestjs/common';
import { IRequest } from '../request/request.interface';
import { isEligible } from '@/core/eligibility';
import { parseStages } from '@/parser';
import {
  Pipeline,
  createPipeline,
  executePipeline,
} from '@/core/pipeline/pipeline';
import { LoggerService } from '../logger/logger.service';
import { StageDefinition } from '@/core/pipeline/stages';
import {
  MaterializedView,
  MaterializedViewDefinition,
} from '@/core/materialized-view';
import { ListenerService } from '../mongodb-listener/listener.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Job, Queue } from 'bullmq';
import { BM_QUEUE_NAME } from '@/consts';

@Injectable()
export class MaterializedViewService {
  private readonly mvs: Array<MaterializedView> = [];

  constructor(
    @Inject(ListenerService) private readonly listenerService: ListenerService,
    @Inject(LoggerService) private readonly logger: LoggerService,
    @InjectQueue(BM_QUEUE_NAME)
    private queue: Queue,
  ) {}

  async addToCreationQueue(
    definition: MaterializedViewDefinition,
  ): Promise<Job> {
    try {
      this.logger.log('Adding materialized view job to queue.');
      const job = await this.queue.add('create', {
        definition,
      });
      return job;
    } catch (error) {
      this.logger.error(
        `Failed to add materialized view job to queue: ${error}`,
      );
      throw error;
    }
  }

  async removeAll(): Promise<void> {
    this.mvs.length = 0;
  }

  getCreationJob(id: string): Promise<Job> {
    return this.queue.getJob(id);
  }

  getMaterializedViews(): MaterializedView[] {
    return this.mvs;
  }

  /**
   * Finds all the materialized views that are eligible for the given pipeline
   * @param pipeline The pipeline to check
   * @returns The list of eligible materialized views
   */
  async findEligibleMV(pipeline: Pipeline): Promise<MaterializedView[]> {
    if (!pipeline) return null;
    return this.mvs.filter((mv) => this.isEligibleMV(mv, pipeline));
  }

  isEligibleMV(
    materializedView: MaterializedView,
    pipeline: Pipeline,
  ): boolean {
    return isEligible(pipeline, materializedView);
  }

  /**
   * Checks if the request can be executed by any of the registered materialized views
   * @param req The request to check
   * @returns True if the request can be executed, false otherwise
   */
  async canExecute(req: IRequest): Promise<boolean> {
    if (!req || req.type !== 'aggregate') return false;
    const pipeline = await this.createPipelineFromRequest(req);
    return (await this.findEligibleMV(pipeline))?.length > 0;
  }

  /**
   * Executes the request on the materialized views
   * @param req The request to execute
   * @returns The result of the request
   */
  async execute(req: IRequest): Promise<any> {
    const pipeline = await this.createPipelineFromRequest(req);
    const mvs = await this.findEligibleMV(pipeline);
    if (mvs.length === 0) return null;

    /**
     * For now we select the first materialized view that is eligible
     * TODO: Select the best materialized view (based on the count of documents in the view)
     */
    const mv = mvs.at(0);
    return executePipeline(pipeline, mv.getView());
  }

  /**
   * Creates a pipeline from the request received from the client
   * If the request is not valid, null is returned
   * @param req
   * @returns
   */
  async createPipelineFromRequest(req: IRequest): Promise<Pipeline> {
    if (!req) return null;

    if (req.pipeline?.length === 0) return null;
    // Parse the stages from the request
    let stages: StageDefinition[];
    try {
      stages = parseStages(req.pipeline);
    } catch (e) {
      this.logger.debug(e);
      return null;
    }
    // Create a pipeline from the stages
    return createPipeline(req.db, req.collName, stages);
  }

  async loadMaterializedView(
    materializedView: MaterializedView,
  ): Promise<void> {
    const pipeline = materializedView.buildAsMongoAggregatePipeline();
    const dbName = materializedView.db;
    const collectionName = materializedView.collection;

    const results = await this.listenerService.executeAggregatePipeline(
      dbName,
      collectionName,
      pipeline,
    );

    materializedView.initialize(results);
  }

  async createMaterializedView(
    definition: MaterializedViewDefinition,
  ): Promise<MaterializedView> {
    const materializedView = new MaterializedView(definition);
    try {
      await this.loadMaterializedView(materializedView);
      this.mvs.push(materializedView);
      return materializedView;
    } catch (error) {
      this.logger.error(`Failed to create materialized view: ${error}`);
      return null;
    }
  }
}
