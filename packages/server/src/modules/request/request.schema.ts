import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { RequestInterface } from './request.interface';

export type RequestDocument = HydratedDocument<Request>;

@Schema()
export class Request implements RequestInterface {
  @Prop()
  name: string;
  @Prop()
  description: string;
  @Prop()
  category: string;
  @Prop()
  createdAt?: Date;
}

export const RequestSchema = SchemaFactory.createForClass(Request);
