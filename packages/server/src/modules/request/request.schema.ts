import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { RequestInterface } from './request.interface';

export type RequestDocument = HydratedDocument<Request>;

@Schema()
export class Request implements RequestInterface {
  @Prop({ type: String, required: true })
  name: string;
  @Prop({ type: String, required: true })
  description: string;
  @Prop({ type: String, required: true })
  category: string;
  @Prop({ type: Date })
  createdAt?: Date;
}

export const RequestSchema = SchemaFactory.createForClass(Request);
