export interface Document {
  _id?: string;
  [key: string]: unknown;
}

export interface AddEvent {
  type: "add";
  document: Document;
}

export interface UpdateEvent {
  type: "update";
  newDocument: Document;
  oldDocument: Document;
}

export interface DeleteEvent {
  type: "delete";
  document: Document;
}

export type ChangeEvent = AddEvent | UpdateEvent | DeleteEvent;

export class Collection<T extends Document> {
  private documents: T[] = [];
  private collectionName: string;
  private lastId = 0;
  private eventListeners: ((
    event: ChangeEvent,
    collection: Collection<T>
  ) => void)[] = [];

  constructor(collectionName: string) {
    this.collectionName = collectionName;
  }

  add(document: T): T {
    document._id ||= (++this.lastId).toString();
    this.documents.push(document);
    this.emitChangeEvent({ type: "add", document });
    return document;
  }

  delete(id: string): boolean {
    const index = this.documents.findIndex((doc) => doc._id === id);
    if (index !== -1) {
      const deletedDocument = this.documents.splice(index, 1)[0];
      this.emitChangeEvent({ type: "delete", document: deletedDocument });
      return true;
    }
    return false;
  }

  get(id: string): T | undefined {
    return this.documents.find((doc) => doc._id === id);
  }

  update(id: string, document: T): boolean {
    const index = this.documents.findIndex((doc) => doc._id === id);
    if (index !== -1) {
      const updatedDocument = this.documents[index];
      this.documents[index] = { ...document, _id: id };
      this.emitChangeEvent({
        type: "update",
        oldDocument: updatedDocument,
        newDocument: this.documents[index],
      });
      return true;
    }
    return false;
  }

  name(): string {
    return this.collectionName;
  }

  values(): T[] {
    return this.documents;
  }

  addChangeListener(
    listener: (event: ChangeEvent, collection: Collection<T>) => void
  ): void {
    this.eventListeners.push(listener);
  }

  removeChangeListener(
    listener: (event: ChangeEvent, collection: Collection<T>) => void
  ): void {
    const index = this.eventListeners.indexOf(listener);
    if (index !== -1) {
      this.eventListeners.splice(index, 1);
    }
  }

  private emitChangeEvent(event: ChangeEvent): void {
    for (const listener of this.eventListeners) {
      listener(event, this);
    }
  }
}
