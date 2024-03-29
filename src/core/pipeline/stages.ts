import type { Accumulator } from './accumulators';
import type { Expression } from './expressions';
import { resolveAllExpressionFields, evaluateExpression } from './expressions';
import type { Document } from '..';

export interface Stage {
  type: StageType;
  execute: (input: Document[], options?: Document) => Document[];
  next?: Stage;
}

export type StageDefinition =
  | GroupStageDefinition
  | MatchStageDefinition
  | LimitStageDefinition;

export type GroupStageDefinition = {
  type: 'group';
  groupExpr: Expression;
  accumulators: Accumulator[];
};

export type StageType = 'match' | 'group' | 'sort' | 'limit' | 'skip';

export class GroupStage {
  type: StageType;
  groupExpr: Expression;
  accumulators: Accumulator[];
  next?: Stage | undefined;

  constructor({ groupExpr, accumulators }: Partial<GroupStageDefinition>) {
    this.type = 'group' as StageType;
    this.groupExpr = groupExpr;
    this.accumulators = accumulators;
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
    const { groupExpr, accumulators } = this;
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

      accumulators.forEach((acc) => {
        const allDocKeys = [...new Set(docs.flatMap((d) => Object.keys(d)))];
        if (allDocKeys.includes(acc.getHash())) {
          group[acc.outputFieldName] = docs[0][acc.getHash()];
        } else {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore - TODO: Fix this
          group[acc.outputFieldName] = acc.evaluate(docs);
        }
      });
      return group;
    });
  }
}

export type MatchStageDefinition = {
  type: 'match';
  conditions: Expression[];
};

export class MatchStage implements Stage {
  type: StageType;
  next?: Stage | undefined;
  conditions: Expression[];

  constructor({ conditions }: Partial<MatchStageDefinition>) {
    this.type = 'match' as StageType;
    this.conditions = conditions;
  }

  /**
   * Executes the match stage on the given document
   * Checks if the document matches all the expressions
   *
   * @param doc - The document to match against
   * @returns The document if it matches, otherwise undefined
   */
  execute(docs: Document[]): Document[] {
    const filters = resolveAllExpressionFields(this.conditions, docs);
    return docs.filter((i) => filters.every((e) => evaluateExpression(e, i)));
  }
}

export type LimitStageDefinition = {
  type: 'limit';
  limit: number;
};

export class LimitStage implements Stage {
  type: StageType;
  next?: Stage | undefined;
  limit: number;

  constructor({ limit }: Partial<LimitStageDefinition>) {
    this.type = 'limit' as StageType;
    this.limit = limit;
  }

  execute(docs: Document[]): Document[] {
    return docs.slice(0, this.limit);
  }
}
