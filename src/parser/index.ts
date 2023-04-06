import { Stage } from '@/core/pipeline/stages';
import { parse } from '@/parser/mongo-aggregation-parser';

export function parsePipeline(input: string): Stage[] {
  return parse(input);
}
