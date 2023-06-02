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

  // Method to initialize accumulators
  private initializeAccumulators(
    groupKeyString: string,
    result: any,
  ): CachedAccumulator[] {
    const accumulators = this.definitions.map(createCachedAccumulator);
    this.results.set(groupKeyString, accumulators);

    const groupCountAcc = createCachedAccumulator({
      operator: 'count',
      outputFieldName: GROUP_COUNT_ACC_NAME,
      expression: this.groupBy,
    }) as CountCachedAccumulator;

    groupCountAcc.initialize(result[GROUP_COUNT_ACC_NAME]);
    this.groupKeyDocumentCount.set(groupKeyString, groupCountAcc);

    accumulators.forEach((a, i) => {
      if (a.operator === 'avg') {
        /**
         * Avg accumulators require a different initialization process.
         * The AvgCachedAccumulator will initialize itself with the sum and count values.
         */
        const avgAcc = a as AvgCachedAccumulator;
        avgAcc.initialize({
          count: result[this.definitions[i].outputFieldName + '_count'],
          sum: result[this.definitions[i].outputFieldName + '_sum'],
        });
      } else {
        a.initialize(result[this.definitions[i].outputFieldName]);
      }
    });

    return accumulators;
  }

  // Method to update accumulators
  private updateAccumulators(
    groupKeyString: string,
    doc: Document,
  ): CachedAccumulator[] {
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

    return accumulators;
  }

  addDocument(doc: Document): void {
    const groupKey = evaluateExpression(this.groupBy, doc);
    const groupKeyString = JSON.stringify(groupKey);

    const accumulators = this.updateAccumulators(groupKeyString, doc);

    this.updateFaultyStatus(accumulators);

    this.emit('change', { type: 'add', document: doc });
  }

  initialize(results: any[]) {
    for (let i = 0; i < results.length; i++) {
      const result = results[i] as any;
      const id = result._id;
      this.initializeAccumulators(JSON.stringify(id), result);
    }
  }

  /**
   * Updates the count accumulator with the given group key and document.
   * If the count reaches zero, deletes the group key from the results and groupKeyDocumentCount maps.
   * @param groupKeyString - The group key as a string.
   * @param doc - The document to delete.
   * @returns True if there are more documents in the group, false otherwise.
   */
  private updateCountAccumulator(
    groupKeyString: string,
    doc: Document,
  ): boolean {
    const countAccumulator = this.groupKeyDocumentCount.get(groupKeyString);
    if (!countAccumulator) {
      // If no count accumulator exists for this group, there's nothing to update.
      return false;
    }

    countAccumulator.deleteDocument(doc);
    if (countAccumulator.getCachedValue() <= 0) {
      // If the count has reached zero, remove this group from the results and groupKeyDocumentCount maps.
      this.results.delete(groupKeyString);
      this.groupKeyDocumentCount.delete(groupKeyString);
      return false;
    }

    // If the count is greater than zero, there are still documents in this group.
    return true;
  }

  /**
   * Updates the result accumulators with the given group key and document.
   * Checks the faulty status after updating.
   * @param groupKeyString - The group key as a string.
   * @param doc - The document to delete.
   */
  private updateResultAccumulators(
    groupKeyString: string,
    doc: Document,
  ): void {
    const accumulators = this.results.get(groupKeyString);
    if (!accumulators) {
      // If no result accumulators exist for this group, there's nothing to update.
      return;
    }

    // Remove the document from each accumulator and update the faulty status.
    accumulators.forEach((a) => a.deleteDocument(doc));
    this.updateFaultyStatus(accumulators);
  }

  /**
   * Deletes a document from the materialized view.
   * Updates the count and result accumulators, and emits a change event.
   * @param doc - The document to delete.
   */
  deleteDocument(doc: Document): void {
    const groupByValue = evaluateExpression(this.groupBy, doc);
    const groupByValueString = JSON.stringify(groupByValue);

    if (this.updateCountAccumulator(groupByValueString, doc)) {
      this.updateResultAccumulators(groupByValueString, doc);
    }

    // Emit a change event after the document has been deleted.
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
