import { EventEmitter } from 'events';
import LibRequest, { Headers } from 'request';
import RequestPromise from 'request-promise';
import AVL from 'avl';
import { IRequest, Request, RequestCached } from '../core/network';
import { IKeyPair } from '../interface/IKeyPair';

export type NetworkCachedPriority = IKeyPair<string | number>;
export type NetworkCallback = LibRequest.RequestCallback;
export type NetworkResponse = LibRequest.Response;
export type NetworkOptions = {
  callback?: NetworkCallback;
  skipCached?: boolean;
  dataComputePriority?: NetworkCachedPriority;
} & RequestPromise.RequestPromiseOptions;

declare interface NetworkService {
  on(event: 'new_request', listener: (r: IRequest) => void): this;
  on(event: 'old_request', listener: (r: IRequest) => void): this;
}

class NetworkService extends EventEmitter {
  readonly HEADERS: Headers = {
    'User-Agent': `Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.75 Mobile Safari/537.36`
  };
  readonly MAX_REQUEST_SAVED = 200 * 1024 * 1024;
  readonly NAME_AVL_NUM_PRIORITY = '___priority';

  private cacheds: IKeyPair<IRequest> = {};
  private sizeByte;
  private cachedsV2: IRequest[];
  private static _instance: NetworkService;

  static get instance() {
    if (!NetworkService._instance) {
      NetworkService._instance = new NetworkService();
    }
    return NetworkService._instance;
  }

  constructor() {
    super();
    this.sizeByte = 0;
    this.cachedsV2 = [];
  }

  public get size() {
    return this.sizeByte;
  }

  public get ids() {
    return Object.keys(this.cacheds);
  }

  public get(uri: string, options?: NetworkOptions) {
    if (!options) {
      options = {};
    }
    const skipCached = options.skipCached || false;
    const callback = options.callback;
    const requestOptions = this.getRequestOptions(options);
    const key = this.getID(uri, 'GET', requestOptions);
    if (!skipCached) {
      const r = this.cacheds[key];
      if (r) {
        this.emit('old_request', r);
        return r;
      }
    }

    const preOptions: RequestPromise.Options = {
      method: 'GET',
      headers: this.HEADERS,
      uri,
      ...(requestOptions || {})
    };
    const request = RequestPromise(uri, preOptions, callback);
    const requestClazz = skipCached ? Request : RequestCached;
    const requestCached = new requestClazz(request);
    if (!skipCached) {
      this.saveCache(key, requestCached);
    }
    this.emit('new_request', requestCached);
    return requestCached;
  }

  public post(uri: string, options?: NetworkOptions) {
    if (!options) {
      options = {};
    }
    const skipCached = options.skipCached || false;
    const callback = options.callback;
    const requestOptions = this.getRequestOptions(options);
    const key = this.getID(uri, 'POST', requestOptions);
    if (!skipCached) {
      const r = this.cacheds[key];
      if (r) {
        this.emit('old_request', r);
        return r;
      }
    }

    const preOptions: RequestPromise.Options = {
      method: 'POST',
      headers: this.HEADERS,
      uri,
      ...(requestOptions || {})
    };
    const request = RequestPromise(uri, preOptions, callback);
    const requestClazz = skipCached ? Request : RequestCached;
    const requestCached = new requestClazz(request);
    if (!skipCached) {
      this.saveCache(key, requestCached);
    }
    this.emit('new_request', requestCached);
    return requestCached;
  }

  private saveCache(key: string, requestCached: RequestCached) {
    this.popIfFull();
    this.cacheds[key] = requestCached;
    requestCached.once('end', () => {
      this.sizeByte += requestCached.getByteLength();
    });
    requestCached.once('abort', () => this.remove(key));
    requestCached.once('error', () => this.remove(key));
  }

  private remove(id: string) {
    if (this.cacheds[id]) {
      this.sizeByte -= this.cacheds[id].getByteLength();
    }
    delete this.cacheds[id];
  }

  private pop() {
    const key = this.ids.shift() || '';
    if (key) {
      const request = this.cacheds[key];
      this.remove(key);
      return request;
    }
    return null;
  }

  private popIfFull() {
    if (this.size > this.MAX_REQUEST_SAVED) {
      return this.pop();
    }
    return null;
  }

  private getID(
    uri: string,
    method: string,
    options?: RequestPromise.RequestPromiseOptions
  ) {
    return uri + JSON.stringify(options || {}) + method;
  }

  private getRequestOptions(
    options: NetworkOptions
  ): RequestPromise.RequestPromiseOptions {
    const clone = { ...options };
    delete clone.skipCached;
    delete clone.callback;
    return clone as RequestPromise.RequestPromiseOptions;
  }
}

export default NetworkService;
