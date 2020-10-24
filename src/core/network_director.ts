import { IKeyPair } from '../interface/IKeyPair';
import DupAVL from './avl_dup';
import { IRequest, RequestCached } from './network';

export type UserDataPriority = IKeyPair<number>;

export interface Node<T extends IRequest> {
  request: T;
  countRequest: number;
  userData: UserDataPriority;
}

export interface UserDataPriorityAVL {
  [field: string]: DupAVL<string, number>;
}

export class NetworkCachedDirector {
  static readonly USER_DATA_COUNT = '__countRequest__';
  private cacheds: Node<RequestCached>[];
  private sizeCachedMax: number;
  private sizeCachedCurrent: number;
  private orderOfPriority: string[];
  private avlPriority: UserDataPriorityAVL;

  constructor() {
    this.cacheds = [];
    this.sizeCachedMax = 300 * 1024 * 1024;
    this.sizeCachedCurrent = 0;
    this.orderOfPriority = [];
    this.avlPriority = {};
  }

  push(request: RequestCached, userDataPriority?: UserDataPriority) {}
  setOrderOfPriority(fields: string[]) {}
}
