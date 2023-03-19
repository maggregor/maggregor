import { StageAggregation } from "@core/stages/index.ts";
import { ASTProperty } from "@parser/index.d.ts";
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
): Aggregation | undefined => {
  const ast = MongoDBParser.parse(query) as ASTStageList;
  const visitor = new AggregationFinder(store);
  // Visit the AST and find the aggregation
  ast.accept(visitor);
  return visitor.getFoundAggregation();
};

export const findResults = (
  query: string,
  store: AggregationStore
): unknown[] => {
  const aggregation = findAvailableAggregation(query, store);
  if (!aggregation) {
    throw new Error("No aggregation found");
  }
  const stage = aggregation as StageAggregation;
  const ast = MongoDBParser.parse(query) as ASTStageList;
  const visitor = new OutputBuilder(stage);
  // Visit the AST and find the output
  ast.accept(visitor);
  const output = visitor.getOutput();
  if (!output) {
    throw new Error("No output found");
  }
  return output;
};

export class AggregationFinder extends MongoDBParser.BaseASTVisitor {
  private store: AggregationStore;
  private foundAggregation: Aggregation | undefined;

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

    const operator = stageGroup.properties[0].operation.operator;
    const operationFieldName = stageGroup.properties[0].operation.field.name;
    this.foundAggregation = allGroups.find((g) => {
      const e = g.getExpression();
      return e.type === operator && e.field === operationFieldName;
    });
    if (!this.foundAggregation) {
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

  getFoundAggregation(): Aggregation | undefined {
    return this.foundAggregation;
  }
}

export class OutputBuilder extends MongoDBParser.BaseASTVisitor {
  private stage: StageAggregation;
  private outputPropertyName: string | undefined;
  private groupBy: string | undefined;

  constructor(aggregation: StageAggregation) {
    super();
    this.stage = aggregation;
  }

  // visitStageGroup(stageGroup: ASTStageGroup) {
  //   this.groupBy = stageGroup.id.name;
  //   super.visitStageGroup(stageGroup);
  // }

  visitProperty(property: ASTProperty) {
    this.outputPropertyName = property.field.name;
  }

  getOutput(): unknown[] | undefined {
    const results = this.stage.get();
    if (this.outputPropertyName) {
      // const groupKey = this.groupBy;
      const outputFieldName = this.outputPropertyName;
      return [...results.entries()].map((e) => {
        return {
          _id: e[0],
          [outputFieldName]: e[1],
        };
      });
    }
  }
}
