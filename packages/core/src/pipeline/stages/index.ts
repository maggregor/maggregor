// deno-lint-ignore-file no-explicit-any
import { Expression, evaluateExpression } from "../expressions/index.ts";

export interface Stage {
  name: StageName;
  execute: (data: any[], options?: any) => any[];
  next?: Stage;
}

export type AccumulatorOperator = "$sum" | "$avg" | "$min" | "$max";

export const accumulatorFunctions = {
  $sum: (e: Expression, data: any[]) => {
    return data.reduce((acc, item) => acc + evaluateExpression(e, item), 0);
  },
  $avg: (e: Expression, data: any[]) => {
    return (
      data.reduce((acc, item) => acc + evaluateExpression(e, item), 0) /
      data.length
    );
  },
  $min: (e: Expression, data: any[]) => {
    return data.reduce((acc, item) => {
      const value = evaluateExpression(e, item);
      return value < acc ? value : acc;
    }, Infinity);
  },
  $max: (e: Expression, data: any[]) => {
    return data.reduce((acc, item) => {
      const value = evaluateExpression(e, item);
      return value > acc ? value : acc;
    }, -Infinity);
  },
};

export interface IGroupStage extends Stage {
  options: GroupStageOptions;
}

export type GroupStageOptions = {
  _id: Expression;
  [key: string]: { [key in AccumulatorOperator]?: Expression } | Expression;
};

export type StageName = "match" | "group" | "sort" | "limit" | "skip";

export interface Pipeline {
  stages: Stage[];
}

export function executePipeline(pipeline: Pipeline, data: any[]): any[] {
  let result = [...data];
  let currentStage: Stage | undefined = pipeline.stages[0];
  do {
    result = currentStage.execute(result);
    currentStage = currentStage.next;
  } while (currentStage);
  return result;
}

export function createPipeline(stages: Stage[]): Pipeline {
  stages.forEach((stage, index) => {
    if (index < stages.length - 1) {
      stage.next = stages[index + 1];
    }
  });
  return { stages };
}

export class GroupStage implements IGroupStage {
  name: StageName;
  options: GroupStageOptions;
  next?: Stage | undefined;

  constructor(options: GroupStageOptions) {
    this.name = "group" as StageName;
    this.options = options;
  }

  // Use the Expression and evaluateExpression functions to evaluate the expressions
  // The evaluateExpression
  execute(data: any[]): any[] {
    const groups: { [key: string]: any[] } = {};
    const groupKeys = Object.keys(this.options);
    data.forEach((item) => {
      const groupId = evaluateExpression(this.options._id, item);
      if (!groups[groupId]) {
        groups[groupId] = [];
      }
      groups[groupId].push(item);
    });

    return Object.entries(groups).map(([key, items]) => {
      // Initialize the new item with the _id
      const newItem: { [key: string]: any } = { _id: key };

      groupKeys.forEach((groupKey) => {
        const operator = Object.keys(this.options[groupKey]).filter(
          (e) => e in accumulatorFunctions
        )[0]! as AccumulatorOperator;
        if (operator in accumulatorFunctions) {
          // @ts-ignore - Temporary fix
          const field = this.options[groupKey][operator];
          newItem[groupKey] = accumulatorFunctions[
            operator as AccumulatorOperator
          ](field, items);
        }
      });
      return newItem;
    });
  }
}

if (import.meta.main) {
  const pipeline = createPipeline([
    new GroupStage({
      _id: { field: "genre" },
      avgScore: { $avg: { field: "score" } },
      sumScore: {
        $sum: {
          operator: "$multiply",
          value: [
            { field: "score" },
            {
              operator: "$multiply",
              value: [
                {
                  operator: "$multiply",
                  value: [{ field: "score" }, { field: "score" }],
                } as Expression,
                { field: "score" },
              ],
            },
          ],
        },
      },
      minScore: { $min: { field: "score" } },
      maxScore: { $max: { field: "score" } },
    }),
  ]);

  const data = [
    { age: 20, score: 10, genre: "Homme", ville: "Paris" },
    { age: 25, score: 900, genre: "Femme", ville: "Lyon" },
    { age: 22, score: 400, genre: "Homme", ville: "Paris" },
  ];

  const result = executePipeline(pipeline, data);
  console.log(result);
}
