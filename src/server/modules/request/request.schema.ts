import type { HydratedDocument } from 'mongoose';
import type {
  IRequest,
  RequestSourceType,
  RequestType,
} from './request.interface';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type RequestDocument = HydratedDocument<Request>;

@Schema({
  minimize: false,
})
export class Request implements IRequest {
  @Prop({ type: String, required: true })
  id: string;

  @Prop({ type: Number, required: true })
  mongoRequestID: number;

  @Prop({ type: String, required: true })
  db: string;

  @Prop({ type: String, required: true })
  type: RequestType;

  @Prop({ type: String })
  collName: string;

  @Prop({ type: Date })
  startAt?: Date;

  @Prop({ type: Date })
  endAt?: Date;

  @Prop({ type: Array })
  pipeline?: Record<string, unknown>[];

  @Prop({ type: Object })
  filter?: Record<string, unknown>;

  @Prop({ type: Object })
  query?: Record<string, unknown>;

  @Prop({ type: Number })
  limit?: number;

  @Prop({ type: String })
  requestSource?: RequestSourceType;
}

export const RequestSchema = SchemaFactory.createForClass(Request);
