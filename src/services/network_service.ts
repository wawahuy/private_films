import { EventEmitter } from 'events';
import LibRequest, { Headers } from 'request';
import RequestPromise from 'request-promise';
import { IRequest, Request, RequestCached } from '../core/network';
import {
  CompairPriority,
  DEFAULT_MINIMUM_PRIORITY,
  NetworkCachedDirector,
  NetworkCachedUserData
} from '../core/network_director';
import { IKeyPair } from '../interface/IKeyPair';

export type NetworkCallback = LibRequest.RequestCallback;
export type NetworkResponse = LibRequest.Response;
export type NetworkOptions = {
  callback?: NetworkCallback;
  skipCached?: boolean;
  userData?: NetworkCachedUserData;
} & RequestPromise.RequestPromiseOptions;

declare interface NetworkService {
  on(event: 'new_request', listener: (r: IRequest) => void): this;
  on(event: 'old_request', listener: (r: IRequest) => void): this;
}

class NetworkService extends EventEmitter {
  readonly HEADERS: Headers = {
    'User-Agent': `Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.75 Mobile Safari/537.36`
  };

  readonly MAX_REQUEST_SAVED = 300 * 1024 * 1024;
  readonly MAX_TIME_PRIORITY = 2 * 60 * 60 * 1000;

  private sizeByte;
  private networkCachedDirector: NetworkCachedDirector;
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
    this.networkCachedDirector = new NetworkCachedDirector();
    this.networkCachedDirector.setMinimumPriority({
      time: CompairPriority.VALUE_MIN,
      filmID: CompairPriority.AMOUNT_MIN,
      ...DEFAULT_MINIMUM_PRIORITY
    });
  }

  public get size() {
    return this.sizeByte;
  }

  public get log() {
    return this.networkCachedDirector.datas.map((data) => {
      if (data) {
        const { request, ...ret } = data;
        return ret;
      }
      return null;
    });
  }

  public get(uri: string, options?: NetworkOptions) {
    if (!options) {
      options = {};
    }
    const skipCached = options.skipCached || false;
    const callback = options.callback;
    const userData = { time: this.timePriority(), ...(options.userData || {}) };
    const requestOptions = this.getRequestOptions(options);
    const key = this.getID(uri, 'GET', requestOptions);
    if (!skipCached) {
      const r = this.networkCachedDirector.find({ uriID: key });
      if (r && r.length) {
        this.networkCachedDirector.update(key, {
          time: this.timePriority(),
          countRequest: (r[0]?.countRequest || 1) + 1
        });
        this.emit('old_request', r[0].request);
        return r[0].request;
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
      this.saveCache(key, requestCached, userData || {});
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
    const userData = { time: this.timePriority(), ...(options.userData || {}) };
    const requestOptions = this.getRequestOptions(options);
    const key = this.getID(uri, 'POST', requestOptions);
    if (!skipCached) {
      const r = this.networkCachedDirector.find({ uriID: key });
      if (r && r.length) {
        this.networkCachedDirector.update(key, {
          time: this.timePriority(),
          countRequest: (r[0]?.countRequest || 1) + 1
        });
        this.emit('old_request', r[0].request);
        return r[0].request;
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
      this.saveCache(key, requestCached, userData || {});
    }
    this.emit('new_request', requestCached);
    return requestCached;
  }

  private saveCache(
    key: string,
    requestCached: RequestCached,
    userData: NetworkCachedUserData
  ) {
    this.popIfFull();
    const uData: NetworkCachedUserData = {
      ...userData,
      uriID: key
    };
    this.networkCachedDirector.insert(requestCached, uData);
    requestCached.once('end', () => {
      this.sizeByte += requestCached.getByteLength();
    });
    requestCached.once('abort', () => this.networkCachedDirector.remove(key));
    requestCached.once('error', () => this.networkCachedDirector.remove(key));
  }

  private popIfFull() {
    if (this.sizeByte > this.MAX_REQUEST_SAVED) {
      const badReq = this.networkCachedDirector.minimumRequsetPriority();
      if (badReq?.uriID) {
        this.sizeByte -= badReq.request.getByteLength();
        this.networkCachedDirector.remove(badReq.uriID);
      }
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

  private timePriority() {
    return new Date().getTime() + this.MAX_TIME_PRIORITY;
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
