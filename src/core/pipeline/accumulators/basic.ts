import { Expression, evaluateExpression } from '../expressions';
import { BaseAccumulator } from './common';
import { AccumulatorDefinition, AccumulatorOperator } from '.';
import { Document } from '../../index';

export abstract class BasicAccumulator extends BaseAccumulator {
  abstract evaluate(docs: Document[]): number;
}

export class AvgBasicAccumulator extends BasicAccumulator {
  constructor(definition: Omit<AccumulatorDefinition, 'operator'>) {
    super('avg', definition);
  }

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
  constructor(definition: Omit<AccumulatorDefinition, 'operator'>) {
    super('count', definition);
  }

  public evaluate(docs: Document[]): number {
    return docs.reduce((acc, doc) => {
      const value = evaluateExpression(this.expression, doc);
      return value ? acc + 1 : acc;
    }, 0);
  }
}

export class SumBasicAccumulator extends BasicAccumulator {
  constructor(definition: Omit<AccumulatorDefinition, 'operator'>) {
    super('sum', definition);
  }

  public evaluate(docs: Document[]): number {
    return docs.reduce((acc, doc) => {
      const value = evaluateExpression(this.expression, doc);
      return acc + value;
    }, 0);
  }
}

export class MinBasicAccumulator extends BasicAccumulator {
  constructor(definition: Omit<AccumulatorDefinition, 'operator'>) {
    super('min', definition);
  }

  public evaluate(docs: Document[]): number {
    return docs.reduce((acc, doc) => {
      const value = evaluateExpression(this.expression, doc);
      return value < acc ? value : acc;
    }, Infinity);
  }
}

export class MaxBasicAccumulator extends BaseAccumulator {
  constructor(definition: Omit<AccumulatorDefinition, 'operator'>) {
    super('max', definition);
  }

  public evaluate(docs: Document[]): number {
    return docs.reduce((acc, doc) => {
      const value = evaluateExpression(this.expression, doc);
      return value > acc ? value : acc;
    }, -Infinity);
  }
}
