/**
 * Helper functions for the parser
 * Transform a array of stages into a compact string representation for the parser
 * @param pipeline - The pipeline to stringify
 * @returns The stringified pipeline
 */
export function stringifyStages(
  pipeline: Array<Record<string, unknown>>,
): string {
  const pipelineStrings = pipeline.map(objectToString);
  return `[${pipelineStrings.join(',')}]`;
}

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
