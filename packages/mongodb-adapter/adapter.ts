import { Aggregation } from "@core/aggregation.ts";
import { Group } from "@core/stages/group.ts";
import * as MongoDBParser from "@parser/index.js";
import type { ASTStageList, ASTStageGroup } from "@parser/index.d.ts";
import { AggregationStore } from "@core/store.ts";

export const findAvailableAggregation = (
  query: string,
  store: AggregationStore
) => {
  const ast = MongoDBParser.parse(query) as ASTStageList;
  // do something with the parsed query
  const visitor = new AggregationFinder(store);
  ast.accept(visitor);
};

export class AggregationFinder extends MongoDBParser.BaseASTVisitor {
  private store: AggregationStore;

  constructor(store: AggregationStore) {
    super();
    this.store = store;
  }

  visitStageGroup(stageGroup: ASTStageGroup) {
    const allGroups: Group[] = this.store
      .getAll()
      .filter((a: Aggregation) => {
        return a.type === "group" && a.getField() === stageGroup.id.name;
      })
      .map((a: Aggregation) => a as Group);
    if (allGroups.length === 0) {
      throw new Error("No group aggregation found");
    }
  }
}
