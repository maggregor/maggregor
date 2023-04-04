import {
  ASTAggregationAvg,
  ASTAggregationMax,
  ASTAggregationMin,
  ASTOutputFieldName,
} from '@parser/ast-types';
import {
  ASTAggregationSum,
  ASTStageList,
  ASTStageGroup,
  ASTProperty,
  ASTReferenceField,
} from '@parser/ast-types';

import { BaseASTVisitor } from '@parser/ast-visitor';

test('Simple counter of stages', async () => {
  const ast = new ASTStageList([
    new ASTStageGroup(new ASTReferenceField('id'), [
      new ASTProperty(
        new ASTOutputFieldName('mySummedScore'),
        new ASTAggregationSum(new ASTReferenceField('score')),
      ),
      new ASTProperty(
        new ASTOutputFieldName('myAveragedScore'),
        new ASTAggregationAvg(new ASTReferenceField('score')),
      ),
    ]),
  ]);

  class StageCounter extends CounterVisitor {
    private count = 0;

    visitStageGroup() {
      this.count++;
    }

    getCount() {
      return this.count;
    }
  }

  const stageCounter = new StageCounter();

  ast.accept(stageCounter);

  expect(stageCounter.getCount()).toBe(1);
});

test('Simple counter visitor on group and field', async () => {
  const ast = new ASTStageList([
    new ASTStageGroup(new ASTReferenceField('id'), [
      new ASTProperty(
        new ASTOutputFieldName('mySummedScore'),
        new ASTAggregationSum(new ASTReferenceField('score')),
      ),
      new ASTProperty(
        new ASTOutputFieldName('myAveragedScore'),
        new ASTAggregationAvg(new ASTReferenceField('score')),
      ),

      new ASTProperty(
        new ASTOutputFieldName('myMaxScore'),
        new ASTAggregationMax(new ASTReferenceField('score')),
      ),

      new ASTProperty(
        new ASTOutputFieldName('myMinScore'),
        new ASTAggregationMin(new ASTReferenceField('score')),
      ),

      new ASTProperty(
        new ASTOutputFieldName('myMinScore2'),
        new ASTAggregationMin(new ASTReferenceField('score')),
      ),
    ]),
  ]);

  const stageCounter = new StageCounter();
  ast.accept(stageCounter);
  expect(stageCounter.getCount()).toBe(1);

  const fieldCounter = new FieldCounter();
  ast.accept(fieldCounter);
  expect(fieldCounter.getCount()).toBe(11);

  const propertyCounter = new PropertyCounter();
  ast.accept(propertyCounter);
  expect(propertyCounter.getCount()).toBe(5);

  const aggregationCounter = new AggregationCounter();
  ast.accept(aggregationCounter);
  expect(aggregationCounter.getCount()).toBe(5);
});

export abstract class CounterVisitor extends BaseASTVisitor {
  protected counter = 0;

  getCount(): number {
    return this.counter;
  }
}

export class StageCounter extends CounterVisitor {
  visitStageList(stageList: ASTStageList): void {
    this.counter += stageList.stages.length;
  }
}

export class FieldCounter extends CounterVisitor {
  visitReferenceField(): void {
    ++this.counter;
  }

  visitOutputFieldName(): void {
    ++this.counter;
  }
}

export class PropertyCounter extends CounterVisitor {
  visitProperty(): void {
    ++this.counter;
  }
}

export class AggregationCounter extends CounterVisitor {
  visitAggregationExpression(): void {
    ++this.counter;
  }
}
