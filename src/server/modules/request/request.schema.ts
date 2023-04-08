import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { RequestInterface } from './request.interface';

export type RequestDocument = HydratedDocument<Request>;

@Schema()
export class Request implements RequestInterface {
  @Prop()
  request: string;

  @Prop()
  id: string;

  @Prop()
  collectionName: string;

  @Prop()
  dbName: string;

  @Prop()
  startAt: Date;

  @Prop()
  endAt?: Date;
}

export const RequestSchema = SchemaFactory.createForClass(Request);
