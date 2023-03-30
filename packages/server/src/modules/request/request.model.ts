import mongoose, { Model } from 'mongoose';
import { Request } from './request.interface';
import { RequestSchema } from './request.schema';

interface RequestModel extends Request, Document {}

export const RequestModel: Model<RequestModel> = mongoose.model<RequestModel>(
  'Request',
  RequestSchema,
);
