import { StageDefinition } from '@/core/pipeline/stages';
import { parse } from '@/parser/mongo-aggregation-parser';
import { stringifyStages } from './helper';

type StagesInput = string | Array<Record<string, unknown>>;

/**
 * Parse the stages input into a array of stage definitions
 * @param input - The stages input
 * @returns The parsed stages
 */
export function parseStages(input: StagesInput): StageDefinition[] {
  if (Array.isArray(input)) {
    input = stringifyStages(input);
  }
  return parse(input);
}
