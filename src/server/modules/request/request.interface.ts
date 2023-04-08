export interface RequestInterface {
  request: string;
  id: string;
  startAt: Date;
  endAt?: Date;
  collectionName: string;
  dbName: string;
}
