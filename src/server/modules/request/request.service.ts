import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MongoDBProxyListener } from '../mongodb-proxy/proxy.service';
import { Request } from './request.schema';
import { IResponse } from '../mongodb-proxy/payload-resolver';
import { MsgResult } from '../mongodb-proxy/protocol';
import { IRequest } from './request.interface';
import { LoggerService } from '../logger/logger.service';
import { CacheService } from '../cache-request/cache.service';
import { parseStages } from '@/parser';
import { isEligible } from '@/core/eligibility';
import { MaterializedView } from '@/core/materialized-view';
import { createPipeline, executePipeline } from '@/core/pipeline/pipeline';
@Injectable()
export class RequestService implements MongoDBProxyListener {
  constructor(
    @InjectModel(Request.name) private readonly requestModel: Model<Request>,
    @Inject(LoggerService) private readonly logger: LoggerService,
    @Inject(CacheService) private readonly cacheService: CacheService,
  ) {
    this.logger.setContext('Requests');
  }

  async create(request: Request): Promise<Request> {
    return this.requestModel.create(request);
  }

  async findAll(): Promise<Request[]> {
    return this.requestModel.find();
  }

  async findOneByRequestId(requestID: number): Promise<Request> {
    return this.requestModel.findOne({ requestID });
  }

  async updateOne(request: Request): Promise<Request> {
    // eslint-disable-next-line
    // @ts-ignore - TODO: fix this
    await this.requestModel.updateOne({ _id: request._id }, request);
    // eslint-disable-next-line
    // @ts-ignore - TODO: fix this
    return this.requestModel.findOne(request._id);
  }

  async deleteByRequestID(requestID: number): Promise<Request> {
    return this.requestModel.findOneAndDelete({ requestID });
  }

  async deleteAll(): Promise<{ deletedCount: number }> {
    const result = await this.requestModel.deleteMany({});
    return { deletedCount: result.deletedCount };
  }

  async count(): Promise<number> {
    return this.requestModel.count();
  }

  // Event: on aggregate query from client
  async onRequest(req: IRequest): Promise<MsgResult> {
    const reqID = req.requestID;
    let results = null;
    req.startAt = new Date();
    if (req.db === 'admin') {
      // We ignore admin requests (such as heartbeat, listDatabases, etc.)
      return null;
    }
    // First, we check if the request is cached
    if (this.cacheService.hasCachedResults(req)) {
      req.endAt = new Date();
      this.logger.log(
        `id:${reqID}: (${req.type}) Answered from cache (${ms(req)})`,
      );
      results = this.cacheService.getCachedResults(req);
      req.requestSource = 'cache';
    } else if (req.type === 'aggregate') {
      // Then, we check if the request can be answered from Materialized Views
      try {
        const stages = parseStages(req.pipeline);
        const pipeline = createPipeline(stages);
        const mv = new MaterializedView({
          groupBy: { field: 'country' },
          accumulatorDefs: [
            {
              operator: 'count',
              expression: { field: 'name' },
            },
          ],
        });
        if (isEligible(pipeline, mv)) {
          results = executePipeline(pipeline, mv.getView());
          req.endAt = new Date();
          this.logger.log(
            `id:${reqID}: (${req.type}) Answered from Materialized View (${ms(
              req,
            )})`,
          );
          req.requestSource = 'processed';
        }
      } catch (e) {
        this.logger.debug(`id:${reqID}: (${req.type}) ${e.message}`);
      }
    }
    if (!req.requestSource) {
      /**
       * Maggregor is not able to answer the request from cache or from the
       * Materialized Views, so we need to forward the request to MongoDB.
       */
      req.requestSource = 'mongodb';
    }
    // Save the request to the database
    this.create(req);
    if (req.requestSource === 'mongodb') {
      // Forward the request to MongoDB
      return null;
    }
    // Maggregor is able to answer by itself
    return {
      db: req.db,
      collection: req.collName,
      results,
      responseTo: req.requestID,
    } as MsgResult;
  }

  // Event: on result from server
  async onResult(res: IResponse): Promise<void> {
    const requestID = res.responseTo;
    const req = await this.findOneByRequestId(requestID);
    if (!req || req.type === 'unknown') {
      return;
    }
    req.endAt = new Date();
    this.updateOne(req);
    this.cacheService.tryCacheResults(req, res);
    this.logger.log(
      `id:${requestID}: (${req.type}) Answered from MongoDB (${ms(req)})`,
    );
  }
}

function ms(req: IRequest) {
  return `${req.endAt.getTime() - req.startAt.getTime()}ms`;
}
