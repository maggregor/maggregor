import type { HydratedDocument } from 'mongoose';
import type { RequestInterface } from './request.interface';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type RequestDocument = HydratedDocument<Request>;

@Schema()
export class Request implements RequestInterface {
  @Prop({ type: Array, required: true })
  request: any;

  @Prop({ type: Number, required: true })
  requestID: number;

  @Prop({ type: String, required: true })
  collectionName: string;

  @Prop({ type: String, required: true })
  dbName: string;

  @Prop({ type: Date, required: true })
  startAt: Date;

  @Prop({ type: Date })
  endAt?: Date;

  @Prop({ type: String })
  source?: 'cache' | 'delegate' | 'intercept';
}

export const RequestSchema = SchemaFactory.createForClass(Request);
