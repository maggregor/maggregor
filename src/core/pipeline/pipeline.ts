import {
  GroupStage,
  LimitStage,
  MatchStage,
  Stage,
  StageDefinition,
} from './stages';
import { Document } from '../index';

export type Pipeline = {
  db: string;
  collection: string;
  stages: Stage[];
};

export function executePipeline(
  pipeline: Pipeline,
  data: Document[],
): Document[] {
  let result = [...data];
  let currentStage: Stage | undefined = pipeline.stages[0];
  do {
    result = currentStage.execute(result);
    currentStage = currentStage.next;
  } while (currentStage);
  return result;
}

export function createPipeline(
  db: string,
  collection: string,
  defs: StageDefinition[],
): Pipeline {
  const stages: Stage[] = defs.map((stageDef) => {
    let stage: Stage;
    if (stageDef.type === 'group') {
      stage = new GroupStage(stageDef);
    } else if (stageDef.type === 'match') {
      stage = new MatchStage(stageDef);
    } else if (stageDef.type === 'limit') {
      stage = new LimitStage(stageDef);
    }
    return stage;
  });
  stages.forEach((stage, index) => {
    if (index < stages.length - 1) {
      stage.next = stages[index + 1];
    }
  });
  return { db, collection, stages } as Pipeline;
}
