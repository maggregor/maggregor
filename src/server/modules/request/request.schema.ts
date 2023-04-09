import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { RequestInterface } from './request.interface';

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

  @Prop({ type: Date, required: false })
  endAt?: Date;
}

export const RequestSchema = SchemaFactory.createForClass(Request);
