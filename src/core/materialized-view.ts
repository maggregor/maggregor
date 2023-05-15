import type { CollectionListener, Document } from '@core/index';
import type {
  AccumulatorDefinition,
  CachedAccumulator,
} from './pipeline/accumulators';
import { createCachedAccumulator } from './pipeline/accumulators';
import { evaluateExpression, toHashExpression } from './pipeline/expressions';
import type { Expression } from './pipeline/expressions';
export interface MaterializedViewDefinition {
  db: string;
  collection: string;
  groupBy: Expression;
  accumulatorDefs: AccumulatorDefinition[];
}

export class MaterializedView implements CollectionListener {
  private _db: string;
  private _collection: string;
  private groupBy: Expression;
  private definitions: AccumulatorDefinition[];
  private results = new Map<string, CachedAccumulator[]>();

  constructor(def: MaterializedViewDefinition) {
    this._db = def.db;
    this._collection = def.collection;
    this.groupBy = def.groupBy;
    this.definitions = def.accumulatorDefs;
  }

  addDocument(doc: Document): void {
    const groupByValue = evaluateExpression(this.groupBy, doc);
    const groupByValueString = JSON.stringify(groupByValue);
    if (!this.results.has(groupByValueString)) {
      this.results.set(
        groupByValueString,
        this.definitions.map((d) => createCachedAccumulator(d)),
      );
    }
    const accumulators = this.results.get(groupByValueString);
    accumulators?.forEach((a) => a.addDocument(doc));
  }

  deleteDocument(doc: Document): void {
    const groupByValue = evaluateExpression(this.groupBy, doc);
    const groupByValueString = JSON.stringify(groupByValue);
    if (!this.results.has(groupByValueString)) {
      return;
    }
    const accumulators = this.results.get(groupByValueString);
    accumulators?.forEach((a) => a.deleteDocument(doc));
  }

  updateDocument(oldDoc: Document, newDoc: Document): void {
    this.updateDocument(oldDoc, newDoc);
  }

  /**
   * Returns the data in the materialized view as an array of objects
   * Each object has the groupBy field and the accumulator fields
   * By default the field names are hashes of the expression that defines the data
   *
   * @returns
   */
  getView(opts?: { useFieldHashes: boolean }): Document[] {
    const useFieldHashes = opts?.useFieldHashes ?? true;
    const hashes = this.getAccumulatorHashes();
    const accumulatorDefs = this.getAccumulatorDefinitions();
    return Array.from(this.results.entries()).map(([key, value]) => {
      const groupByKey = useFieldHashes
        ? toHashExpression(this.groupBy)
        : '_id';
      const obj: Document = {
        [groupByKey]: JSON.parse(key),
      };
      value.forEach((a, i) => {
        let accKey: string;
        if (useFieldHashes) {
          accKey = hashes[i];
        } else {
          accKey = accumulatorDefs[i].outputFieldName;
        }
        obj[accKey] = a.getCachedValue();
      });
      return obj;
    });
  }

  initialize(results: any[]) {
    for (let i = 0; i < results.length; i++) {
      const result = results[i] as any;
      const id = result._id;
      const accumulators = this.definitions.map((d) => {
        const acc = createCachedAccumulator(d);
        acc.__init(result[d.outputFieldName]);
        return acc;
      });
      this.results.set(JSON.stringify(id), accumulators);
    }
  }

  getAccumulatorHashes(): string[] {
    return this.definitions.map((d) => createCachedAccumulator(d).getHash());
  }

  getGroupExpression(): Expression {
    return this.groupBy;
  }

  getAccumulatorDefinitions(): AccumulatorDefinition[] {
    return this.definitions;
  }

  /**
   * Builds an expression based on the input Expression object.
   * @param expression - The input Expression object.
   * @returns A MongoDB expression or value.
   */
  buildExpression(expression: Expression): any {
    if (expression.field) {
      return `$${expression.field}`;
    }

    if (expression.operator) {
      const operator = `$${expression.operator}`;

      if (Array.isArray(expression.value)) {
        return {
          [operator]: expression.value.map((arg) => {
            return this.buildExpression(arg as Expression);
          }),
        };
      }

      return {
        [operator]: [this.buildExpression(expression.value as Expression)],
      };
    }

    return expression.value;
  }

  /**
   * Builds a MongoDB aggregation pipeline using the accumulator definitions.
   * @returns A MongoDB aggregation pipeline.
   */
  buildMongoAggregatePipeline(): any {
    const accumulators = this.getAccumulatorDefinitions();
    const accumulatorsOutput: Record<string, any> = {};

    accumulators.forEach((acc) => {
      accumulatorsOutput[acc.outputFieldName] = {
        [`$${acc.operator}`]: this.buildExpression(acc.expression),
      };
    });

    return [
      {
        $group: {
          _id: this.buildExpression(this.groupBy),
          ...accumulatorsOutput,
        },
      },
    ];
  }

  get db(): string | undefined {
    return this._db;
  }

  get collection(): string | undefined {
    return this._collection;
  }
}
