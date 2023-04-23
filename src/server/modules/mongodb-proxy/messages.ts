export type MsgRequest = {
  requestID: number;
  dbName: string;
  collectionName: string;
  pipeline: any[];
};

export type MsgResponse = {
  requestID: number;
  responseTo: number;
  data: any;
};

export type MsgResult = {
  db: string;
  collection: string;
  results: any[];
  responseTo: number;
};
