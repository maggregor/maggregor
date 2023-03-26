import { Document } from "@core/index.ts";
import {
  evaluateExpression,
  Expression,
  resolveAllExpressionFields,
} from "@core/pipeline/expressions.ts";
import { Accumulator } from "@core/pipeline/accumulators/index.ts";

export interface Stage {
  name: StageName;
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

export type StageName = "match" | "group" | "sort" | "limit" | "skip";

export class GroupStage implements IGroupStage {
  name: StageName;
  options: GroupStageOptions;
  next?: Stage | undefined;

  constructor(options: GroupStageOptions) {
    this.name = "group" as StageName;
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
      const key = evaluateExpression(groupExpr, doc);
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
        // @ts-ignore - accumulator is a valid accumulator
        group[outputField] = accumulator.evaluate(docs);
      });
      return group;
    });
  }
}

export type MatchStageOptions = {
  filterExprs: Expression[];
};

export class MatchStage implements Stage {
  name: StageName;
  next?: Stage | undefined;
  options: MatchStageOptions;

  constructor(options: MatchStageOptions) {
    this.name = "match" as StageName;
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
  name: StageName;
  next?: Stage | undefined;
  limit: number;

  constructor(options: LimitStageOptions) {
    this.name = "limit" as StageName;
    this.limit = options.limit;
  }

  execute(docs: Document[]): Document[] {
    return docs.slice(0, this.limit);
  }
}
