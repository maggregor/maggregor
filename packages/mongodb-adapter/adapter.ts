import { Aggregation } from "@core/aggregation.ts";
import { Group } from "@core/stages/group.ts";
import * as MongoDBParser from "@parser/index.js";
import type { ASTStageList, ASTStageGroup, ASTStage } from "@parser/index.d.ts";
import { AggregationStore } from "@core/store.ts";

const throwUnsupportedFeatureError = (feature: string) => {
  throw new Error(`Unsupported feature: ${feature}`);
};

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

  visitStageList(stageList: ASTStageList): void {
    const stages: ASTStage[] = stageList.stages;
    const groups = stages.filter((s) => s.type === "StageGroup").length;
    if (groups > 1) {
      throwUnsupportedFeatureError("Multiple group stages");
    }
    if (stages.length > 0) {
      // Continue: visit the stages
      super.visitStageList(stageList);
    }
  }

  visitStageGroup(stageGroup: ASTStageGroup) {
    const allGroups = this.findGroups(this.store).filter(
      (g) => g.getField() === stageGroup.id.name
    );

    if (allGroups.length === 0) {
      throw new Error("No group aggregation found");
    }
  }

  private findGroups(store: AggregationStore): Group[] {
    return store
      .getAll()
      .filter((a: Aggregation) => {
        return a.type === "group";
      })
      .map((a: Aggregation) => a as Group);
  }
}
