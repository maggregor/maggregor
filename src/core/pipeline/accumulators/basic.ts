import { Expression, evaluateExpression } from '../expressions';
import { BaseAccumulator } from './common';
import { AccumulatorDefinition, AccumulatorOperator } from '.';
import { Document } from '../../index';

export abstract class BasicAccumulator extends BaseAccumulator {
  abstract evaluate(docs: Document[]): number;
}

export class AvgBasicAccumulator extends BasicAccumulator {
  declare operator: 'avg';

  public evaluate(docs: Document[]): number {
    return (
      docs.reduce((acc, doc) => {
        const value = evaluateExpression(this.expression, doc);
        return acc + value;
      }, 0) / docs.length
    );
  }
}

export class CountBasicAccumulator extends BasicAccumulator {
  declare operator: 'count';

  public evaluate(docs: Document[]): number {
    return docs.reduce((acc, doc) => {
      const value = evaluateExpression(this.expression, doc);
      return value ? acc + 1 : acc;
    }, 0);
  }
}

export class SumBasicAccumulator extends BasicAccumulator {
  declare operator: 'sum';

  public evaluate(docs: Document[]): number {
    return docs.reduce((acc, doc) => {
      const value = evaluateExpression(this.expression, doc);
      return acc + value;
    }, 0);
  }
}

export class MinBasicAccumulator extends BasicAccumulator {
  declare operator: 'min';

  public evaluate(docs: Document[]): number {
    return docs.reduce((acc, doc) => {
      const value = evaluateExpression(this.expression, doc);
      return value < acc ? value : acc;
    }, Infinity);
  }
}

export class MaxBasicAccumulator extends BaseAccumulator {
  declare operator: 'max';

  public evaluate(docs: Document[]): number {
    return docs.reduce((acc, doc) => {
      const value = evaluateExpression(this.expression, doc);
      return value > acc ? value : acc;
    }, -Infinity);
  }
}
