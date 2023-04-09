export interface RequestInterface {
  request: any;
  requestID: number;
  startAt: Date;
  endAt?: Date;
  collectionName: string;
  dbName: string;
  source?: 'cache' | 'delegate' | 'intercept';
}
