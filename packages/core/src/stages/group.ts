import { createExpression } from "@core/factory.ts";
import type { ExpressionAggregation } from "@core/expressions/index.ts";
import { Document } from "@core/utils/collection.ts";
import { FieldReference } from "@core/aggregation.ts";
import { Expression } from "@core/expressions/index.ts";
import { StageAggregation } from "@core/stages/index.ts";

export class Group extends StageAggregation {
  private __cachedDocs: Map<string, ExpressionAggregation> = new Map();
  public type = "group";

  constructor(field: FieldReference, private expression: Expression) {
    super(field);
  }

  onAddDocument(doc: Document): void {
    const key = doc[this.field] as string;
    if (!this.__cachedDocs.has(key)) {
      const aggregation: ExpressionAggregation = createExpression(
        this.expression
      );
      aggregation.init([doc]);
      this.__cachedDocs.set(key, aggregation);
    }
    this.__cachedDocs.get(key)!.onAddDocument(doc);
  }

  onDeleteDocument(doc: Document): void {
    const key = doc[this.field] as string;
    if (this.__cachedDocs.has(key)) {
      this.__cachedDocs.get(key)!.onDeleteDocument(doc);
    }
  }

  onUpdateDocument(oldDoc: Document, newDoc: Document): void {
    const oldKey = oldDoc[this.field] as string;
    const newKey = newDoc[this.field] as string;
    if (oldKey === newKey) {
      this.__cachedDocs.get(oldKey)!.onUpdateDocument(oldDoc, newDoc);
    } else {
      this.onDeleteDocument(oldDoc);
      this.onAddDocument(newDoc);
    }
  }

  get(): Map<string, unknown> {
    const result = new Map();
    for (const [key, value] of this.__cachedDocs) {
      result.set(key, value.get());
    }
    return result;
  }

  reset(): void {
    this.__cachedDocs.clear();
  }

  getField(): FieldReference {
    return this.field;
  }
}
