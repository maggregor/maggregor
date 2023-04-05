import { Accumulator, AccumulatorDefinition, AccumulatorOperator } from '.';
import { Expression } from '../expressions';
import crypto from 'crypto';

export abstract class BaseAccumulator implements Accumulator {
  public operator: AccumulatorOperator;
  public expression: Expression;
  public outputFieldName: string | undefined;
  public hash: string;

  constructor(
    operator: AccumulatorOperator,
    def?: Omit<AccumulatorDefinition, 'operator'>,
  ) {
    this.operator = operator;
    this.expression = def?.expression;
    this.outputFieldName = def?.outputFieldName;
  }

  public getHash() {
    if (!this.hash) {
      this.hash = hash({
        expression: this.expression,
        operator: this.operator,
      });
    }
    return this.hash;
  }

  public equals(acc: Accumulator): boolean {
    return (
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      deepEqual(this.expression, acc.expression) &&
      this.operator === acc.operator
    );
  }
}

// TODO: Probably costly to do this every time
export function hash(o: Object): string {
  const sorted = {};
  Object.keys(o)
    .sort()
    .forEach((key) => {
      sorted[key] = o[key];
    });
  const json = JSON.stringify(sorted);
  const hash = crypto.createHash('sha256');
  hash.update(json);
  return hash.digest('hex');
}

export function deepEqual(
  objet1: Record<string, unknown>,
  objet2: Record<string, unknown>,
): boolean {
  const keys1 = Object.keys(objet1).sort();
  const keys2 = Object.keys(objet2).sort();
  if (keys1.length !== keys2.length) {
    return false;
  }
  for (let i = 0; i < keys1.length; i++) {
    const key = keys1[i];
    if (typeof objet1[key] === 'object' && typeof objet2[key] === 'object') {
      if (
        !deepEqual(
          objet1[key] as Record<string, unknown>,
          objet2[key] as Record<string, unknown>,
        )
      ) {
        return false;
      }
    } else if (objet1[key] !== objet2[key]) {
      return false;
    }
  }
  return true;
}
