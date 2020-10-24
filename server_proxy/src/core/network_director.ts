import requestPromise from 'request-promise';
import { IKeyPair } from '../interface/IKeyPair';
import { AvlDataFind, Data, DataResult } from './avl_data_find';
import { IRequest, RequestCached } from './network';

export enum CompairPriority {
  AMOUNT_MAX,
  AMOUNT_MIN,
  VALUE_MAX,
  VALUE_MIN
}

export interface NetworkCachedUserData extends Data {
  countRequest?: number;
  uriID?: string;
}

export interface NetworkCachedNode extends NetworkCachedUserData {
  request: RequestCached;
}

export const DEFAULT_MINIMUM_PRIORITY = {
  countRequest: CompairPriority.VALUE_MIN
};

export class NetworkCachedDirector {
  private _avlRequestCached: AvlDataFind<NetworkCachedNode>;
  private _priorityMinimumRequestFields: IKeyPair<CompairPriority>;

  constructor() {
    this._avlRequestCached = new AvlDataFind();
    this._avlRequestCached.exceptFields(['request']);
    this._priorityMinimumRequestFields = DEFAULT_MINIMUM_PRIORITY;
  }

  get size() {
    return 0;
  }

  get datas() {
    return this._avlRequestCached.datas;
  }

  find(userDataField: NetworkCachedUserData) {
    const fields = Object.keys(userDataField);
    let avlCurrent: AvlDataFind<NetworkCachedNode> | undefined = this
      ._avlRequestCached;
    let avlResult: DataResult<NetworkCachedNode> | null | undefined;
    let field = fields.shift();
    while (field) {
      avlResult = avlCurrent?.find(field, userDataField[field]);
      field = fields.shift();
      if (field) {
        avlCurrent = avlResult?.nextAvl;
      }
    }
    return avlResult?.data;
  }

  insert(
    request: RequestCached,
    userDataFields?: NetworkCachedUserData
  ): NetworkCachedNode {
    const node: NetworkCachedNode = {
      uriID: this.getUriID(request),
      request,
      countRequest: 1,
      ...(userDataFields || {})
    };
    this._avlRequestCached.insert(node);
    return node;
  }

  update(uriID: string, userDataFields?: NetworkCachedUserData) {
    const nodes = this.find({ uriID });
    if (nodes && nodes.length) {
      this._avlRequestCached.remove(nodes[0]);
      this._avlRequestCached.insert({ ...nodes[0], ...(userDataFields || {}) });
    }
  }

  remove(uriID: string) {
    const nodes = this.find({ uriID });
    if (nodes && nodes.length) {
      this._avlRequestCached.remove(nodes[0]);
    }
  }

  setMinimumPriority(pr: IKeyPair<CompairPriority>) {
    this._priorityMinimumRequestFields = pr;
  }

  minimumRequsetPriority() {
    const fields = Object.keys(this._priorityMinimumRequestFields);
    let avlCurrent: AvlDataFind<NetworkCachedNode> | undefined = this
      ._avlRequestCached;
    let avlResult: DataResult<NetworkCachedNode> | null | undefined;
    let field = fields.shift();

    while (field) {
      const type = this._priorityMinimumRequestFields[field];
      switch (type) {
        case CompairPriority.AMOUNT_MAX:
          avlResult = avlCurrent?.maxOfNumberValue(field);
          break;
        case CompairPriority.AMOUNT_MIN:
          avlResult = avlCurrent?.minOfNumberValue(field);
          break;
        case CompairPriority.VALUE_MAX:
          avlResult = avlCurrent?.max(field);
          break;
        case CompairPriority.VALUE_MIN:
          avlResult = avlCurrent?.min(field);
          break;
      }

      field = fields.shift();
      if (field) {
        avlCurrent = avlResult?.nextAvl;
      }
    }

    if (avlResult?.data.length) {
      return avlResult.data[0];
    }
    return null;
  }

  getUriID(request: RequestCached) {
    const rq = request.requestNative;
    const key =
      (rq?.uri.href || '') +
      (rq?.method || '') +
      JSON.stringify(rq?.body || {}) +
      JSON.stringify(rq?.form || {});
    return key;
  }
}
