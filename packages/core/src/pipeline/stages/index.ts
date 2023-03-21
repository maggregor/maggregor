import { Expression, evaluateExpression } from "../expressions/index.ts";

export interface Stage {
  name: StageName;
  execute: (data: any[], options?: any) => any[];
  next?: Stage;
}

export interface IGroupStage extends Stage {
  options: GroupStageOptions;
}

export type GroupStageOptions = {
  _id: Expression;
  [key: string]: Expression;
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
        const operation = Object.keys(this.options[groupKey])[0];
        const field = this.options[groupKey][operation as any];
        if (operation === "$sum") {
          newItem[groupKey] = items.reduce(
            (acc, item) =>
              acc +
              (typeof field === "number"
                ? field
                : evaluateExpression(field, item)),
            0
          );
        } else if (operation === "$avg") {
          newItem[groupKey] =
            items.reduce(
              (acc, item) => acc + evaluateExpression(field, item),
              0
            ) / items.length;
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
      avgScore: { $avg: { field: "score" } } as any,
      sumScore: {
        $sum: {
          operator: "$multiply",
          value: [
            { field: "score" },
            {
              operator: "$multiply",
              value: [{ field: "score" }, { field: "score" }],
            },
          ],
        },
      } as any,
    }),
    new GroupStage({
      _id: { operator: "$toUpper", value: { field: "_id" } },
      avgScoreWesh: { $avg: { field: "avgScore" } } as any,
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
