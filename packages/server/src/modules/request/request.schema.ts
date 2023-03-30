import { Schema } from 'mongoose';

export const RequestSchema = new Schema({
  name: String,
  description: String,
  category: String,
  createdAt: { type: Date, default: Date.now },
});
