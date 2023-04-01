import { Accumulator } from "./accumulators";
import {
  Expression,
  resolveAllExpressionFields,
  evaluateExpression,
} from "./expressions";
import { Document } from "..";

export interface Stage {
  type: StageType;
  execute: (input: Document[], options?: Document) => Document[];
  next?: Stage;
}

export interface IGroupStage extends Stage {
  options: GroupStageOptions;
}

export type GroupStageOptions = {
  groupExpr: Expression;
  accumulators: {
    [outputField: string]: Accumulator;
  };
};

export type StageType = "match" | "group" | "sort" | "limit" | "skip";

export class GroupStage implements IGroupStage {
  type: StageType;
  options: GroupStageOptions;
  next?: Stage | undefined;

  constructor(options: GroupStageOptions) {
    this.type = "group" as StageType;
    this.options = options;
  }

  /**
   * Execute the group stage
   * Group the documents by the _id expression
   * Then apply the accumulator operators on the grouped documents
   *
   * @param data - The documents to group
   * @returns The grouped documents
   */
  execute(data: Document[]): Document[] {
    const { groupExpr, accumulators } = this.options;
    const groups = data.reduce((acc, doc) => {
      const resolved = resolveAllExpressionFields([groupExpr], [doc]);
      const key = evaluateExpression(resolved[0], doc);
      if (acc[key]) {
        acc[key].push(doc);
      } else {
        acc[key] = [doc];
      }
      return acc;
    }, {} as Record<string, Document[]>);

    return Object.entries(groups).map(([key, docs]) => {
      const group = { _id: key };

      Object.entries(accumulators).forEach(([outputField, accumulator]) => {
        // @ts-ignore - Fix this
        const allDocKeys = [...new Set(docs.flatMap((d) => Object.keys(d)))];
        if (allDocKeys.includes(accumulator.hash)) {
          // @ts-ignore - Fix this
          group[outputField] = docs[0][accumulator.hash];
        } else {
          // @ts-ignore - Fix this
          group[outputField] = accumulator.evaluate(docs);
        }
      });
      return group;
    });
  }
}

export type MatchStageOptions = {
  filterExprs: Expression[];
};

export class MatchStage implements Stage {
  type: StageType;
  next?: Stage | undefined;
  options: MatchStageOptions;

  constructor(options: MatchStageOptions) {
    this.type = "match" as StageType;
    this.options = options;
  }

  /**
   * Executes the match stage on the given document
   * Checks if the document matches all the expressions
   *
   * @param doc - The document to match against
   * @returns The document if it matches, otherwise undefined
   */
  execute(docs: Document[]): Document[] {
    const { filterExprs } = this.options;
    const filters = resolveAllExpressionFields(filterExprs, docs);
    return docs.filter((i) => filters.every((e) => evaluateExpression(e, i)));
  }
}

export type LimitStageOptions = {
  limit: number;
};

export class LimitStage implements Stage {
  type: StageType;
  next?: Stage | undefined;
  limit: number;

  constructor(options: LimitStageOptions) {
    this.type = "limit" as StageType;
    this.limit = options.limit;
  }

  execute(docs: Document[]): Document[] {
    return docs.slice(0, this.limit);
  }
}
