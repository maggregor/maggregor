import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
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

@Injectable()
export class MaterializedViewService {
  private readonly mvs: MaterializedView[] = [];

  constructor(@Inject(LoggerService) private readonly logger: LoggerService) {}

  async register(definition: MaterializedViewDefinition): Promise<void> {
    this.mvs.push(new MaterializedView(definition));
  }

  /**
   * Finds all the materialized views that are eligible for the given pipeline
   * @param pipeline The pipeline to check
   * @returns The list of eligible materialized views
   */
  async findEligibleMV(pipeline: Pipeline): Promise<MaterializedView[]> {
    if (!pipeline) return null;
    return this.mvs.filter((mv) => isEligible(pipeline, mv));
  }

  /**
   * Checks if the request can be executed by any of the registered materialized views
   * @param req The request to check
   * @returns True if the request can be executed, false otherwise
   */
  async canExecute(req: IRequest): Promise<boolean> {
    const pipeline = await this.createPipelineFromRequest(req);
    return (await this.findEligibleMV(pipeline)).length > 0;
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

  async createPipelineFromRequest(req: IRequest): Promise<Pipeline> {
    if (!req) return null;

    // Maggregor only supports aggregate requests on materialized views
    if (req.type !== 'aggregate' || !req.pipeline) return null;

    // Parse the stages from the request
    let stages: StageDefinition[];
    try {
      stages = parseStages(req.pipeline);
    } catch (e) {
      this.logger.debug(e);
      return null;
    }
    // Create a pipeline from the stages
    return createPipeline(stages);
  }
}
