import type { CollectionListener, Document } from '@core/index';
import type {
  AccumulatorDefinition,
  AvgCachedAccumulator,
  CachedAccumulator,
  CountCachedAccumulator,
} from './pipeline/accumulators';
import { createCachedAccumulator } from './pipeline/accumulators';
import { evaluateExpression, toHashExpression } from './pipeline/expressions';
import type { Expression } from './pipeline/expressions';
import EventEmitter from 'events';

export interface MaterializedViewDefinition {
  db: string;
  collection: string;
  groupBy: Expression;
  accumulatorDefs: AccumulatorDefinition[];
}

// Name of the accumulator storing the document count for each group.
const GROUP_COUNT_ACC_NAME = '__id_count';

export class MaterializedView
  extends EventEmitter
  implements CollectionListener
{
  private _db: string;
  private _collection: string;
  private groupBy: Expression;
  private definitions: AccumulatorDefinition[];

  // Map storing document count for each group. Allows group removal when there are no more documents.
  private groupKeyDocumentCount = new Map<string, CountCachedAccumulator>();

  // Map storing results for each group.
  private results = new Map<string, CachedAccumulator[]>();

  // Boolean flag indicating if the view is faulty.
  private faulty = false;

  constructor(def: MaterializedViewDefinition) {
    super();
    this._db = def.db;
    this._collection = def.collection;
    this.groupBy = def.groupBy;
    this.definitions = def.accumulatorDefs;
  }

  private updateFaultyStatus(accumulators?: CachedAccumulator[]): void {
    if (this.faulty) {
      // We will check if any accumulators in the global results are faulty
      // If so, we will mark this materialized view as faulty
      const allAccumulators = Array.from(this.results.values()).flat();
      this.faulty = allAccumulators.some((a) => a.isFaulty());
    } else {
      // If the materialized view is not faulty, we will check if any of the accumulators
      // for this group are faulty
      this.faulty = accumulators?.some((a) => a.isFaulty());
    }
  }

  addDocument(doc: Document): void {
    const groupKey = evaluateExpression(this.groupBy, doc);
    const groupKeyString = JSON.stringify(groupKey);

    let accumulators = this.results.get(groupKeyString);
    if (!accumulators) {
      accumulators = this.definitions.map(createCachedAccumulator);
      this.results.set(groupKeyString, accumulators);
    }

    if (!this.groupKeyDocumentCount.has(groupKeyString)) {
      this.groupKeyDocumentCount.set(
        groupKeyString,
        createCachedAccumulator({
          operator: 'count',
          outputFieldName: GROUP_COUNT_ACC_NAME,
          expression: this.groupBy,
        }) as CountCachedAccumulator,
      );
    }
    this.groupKeyDocumentCount.get(groupKeyString).addDocument(doc);
    accumulators.forEach((a) => a.addDocument(doc));

    this.updateFaultyStatus(accumulators);

    this.emit('change', { type: 'add', document: doc });
  }

  deleteDocument(doc: Document): void {
    const groupByValue = evaluateExpression(this.groupBy, doc);
    const groupByValueString = JSON.stringify(groupByValue);

    const countAccumulator = this.groupKeyDocumentCount.get(groupByValueString);
    if (countAccumulator) {
      countAccumulator.deleteDocument(doc);
      if (countAccumulator.getCachedValue() <= 0) {
        this.results.delete(groupByValueString);
        this.groupKeyDocumentCount.delete(groupByValueString);
      } else {
        const accumulators = this.results.get(groupByValueString);
        accumulators.forEach((a) => a.deleteDocument(doc));
        this.updateFaultyStatus(accumulators);
        this.groupKeyDocumentCount.get(groupByValueString).deleteDocument(doc);
      }
    }

    this.emit('change', { type: 'delete', document: doc });
  }

  updateDocument(oldDoc: Document, newDoc: Document): void {
    this.deleteDocument(oldDoc);
    this.addDocument(newDoc);
    this.emit('change', {
      type: 'update',
      oldDocument: oldDoc,
      newDocument: newDoc,
    });
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
        const accKey = useFieldHashes
          ? hashes[i]
          : accumulatorDefs[i].outputFieldName;
        obj[accKey] = a.getCachedValue();
      });
      return obj;
    });
  }

  initialize(results: any[]) {
    for (let i = 0; i < results.length; i++) {
      const result = results[i] as any;
      const id = result._id;
      const groupCountAcc = createCachedAccumulator({
        operator: 'count',
        outputFieldName: GROUP_COUNT_ACC_NAME,
        expression: this.groupBy,
      }) as CountCachedAccumulator;
      groupCountAcc.initialize(result[GROUP_COUNT_ACC_NAME]);
      this.groupKeyDocumentCount.set(JSON.stringify(id), groupCountAcc);
      const accumulators = this.definitions.map((d: AccumulatorDefinition) => {
        const acc = createCachedAccumulator(d);
        if (acc.operator === 'avg') {
          /**
           * Avg accumulators require a different initialization process.
           * The AvgCachedAccumulator will initialize itself with the sum and count values.
           */
          const avgAcc = acc as AvgCachedAccumulator;
          avgAcc.initialize({
            count: result[d.outputFieldName + '_count'],
            sum: result[d.outputFieldName + '_sum'],
          });
        } else {
          acc.initialize(result[d.outputFieldName]);
        }
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
  buildAsMongoExpression(expression: Expression): any {
    if (expression.field) {
      return `$${expression.field}`;
    }

    if (expression.operator) {
      const operator = `$${expression.operator}`;

      if (Array.isArray(expression.value)) {
        return {
          [operator]: expression.value.map((arg) => {
            return this.buildAsMongoExpression(arg as Expression);
          }),
        };
      }

      return {
        [operator]: [
          this.buildAsMongoExpression(expression.value as Expression),
        ],
      };
    }

    return expression.value;
  }

  /**
   * Builds a MongoDB aggregation pipeline using the accumulator definitions.
   * @returns A MongoDB aggregation pipeline.
   */
  buildAsMongoAggregatePipeline(): any {
    const accumulators = this.getAccumulatorDefinitions();
    const accumulatorsOutput: Record<string, any> = {};

    accumulatorsOutput[GROUP_COUNT_ACC_NAME] = {
      $sum: 1,
    };

    accumulators.forEach((acc) => {
      if (acc.operator === 'avg') {
        accumulatorsOutput[acc.outputFieldName + '_sum'] = {
          $sum: this.buildAsMongoExpression(acc.expression),
        };
        accumulatorsOutput[acc.outputFieldName + '_count'] = {
          $sum: 1,
        };
      } else {
        accumulatorsOutput[acc.outputFieldName] = {
          [`$${acc.operator}`]: this.buildAsMongoExpression(acc.expression),
        };
      }
    });

    return [
      {
        $group: {
          _id: this.buildAsMongoExpression(this.groupBy),
          ...accumulatorsOutput,
        },
      },
    ];
  }

  get db(): string {
    return this._db;
  }

  get collection(): string {
    return this._collection;
  }

  isFaulty(): boolean {
    return this.faulty;
  }
}
