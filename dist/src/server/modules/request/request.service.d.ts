import { Model } from 'mongoose';
import { MongoDBProxyListener } from '../mongodb-proxy/proxy.service';
import { MsgAggregate } from '../mongodb-proxy/interceptors/aggregate.interceptor';
import { MsgResult as MsgResult } from '../mongodb-proxy/protocol/protocol';
import { InterceptedReply as MsgReply } from '../mongodb-proxy/interceptors/reply-interceptor';
import { Request } from './request.schema';
export declare class RequestService implements MongoDBProxyListener {
    private readonly requestModel;
    private cache;
    constructor(requestModel: Model<Request>);
    create(request: Request): Promise<Request>;
    findAll(): Promise<Request[]>;
    findOneByRequestId(requestID: number): Promise<Request>;
    updateOne(request: Request): Promise<Request>;
    deleteByRequestID(requestID: number): Promise<Request>;
    onAggregateQueryFromClient(msg: MsgAggregate): Promise<MsgResult>;
    onResultFromServer(msg: MsgReply): Promise<void>;
    private hasCachedResults;
    private getCachedResults;
    private cacheResults;
}
