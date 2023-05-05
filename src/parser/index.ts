import { Stage } from '@/core/pipeline/stages';
import { parse } from '@/parser/mongo-aggregation-parser';

type StagesInput = string | Array<Record<string, unknown>>;

function objectToString(obj: Record<string, unknown>): string {
  const keyValuePairs = Object.entries(obj)
    .map(([key, value]) => {
      if (typeof value === 'object' && value !== null) {
        return `${key}:${objectToString(value as Record<string, unknown>)}`;
      } else {
        return `${key}:${JSON.stringify(value)}`;
      }
    })
    .join(',');

  return `{${keyValuePairs}}`;
}

function convertPipelineToJson(
  pipeline: Array<Record<string, unknown>>,
): string {
  const pipelineStrings = pipeline.map(objectToString);
  return `[${pipelineStrings.join(',')}]`;
}

export function parseStages(input: StagesInput): Stage[] {
  const inputStr =
    typeof input === 'string' ? input : convertPipelineToJson(input);
  return parse(inputStr);
}
