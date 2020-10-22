import request, { Headers } from 'request';
import RequestPromise from 'request-promise';
import { IRequest, RequestCached } from '../core/network';

export interface ICached {
  [key: string]: IRequest;
}

export interface IKeyPair {
  [key: string]: unknown;
}

class RequestService {
  readonly MAX_REQUEST_SAVED = 200;
  readonly HEADERS: Headers = {
    'User-Agent': `Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.75 Mobile Safari/537.36`
  };

  private cached: ICached = {};

  private static _instance: RequestService;
  static get instance() {
    if (!RequestService._instance) {
      RequestService._instance = new RequestService();
    }
    return RequestService._instance;
  }

  get size() {
    return this.ids.length;
  }

  get ids() {
    return Object.keys(this.cached);
  }

  get(
    uri: string,
    callback?: request.RequestCallback,
    options?: RequestPromise.Options,
    skipCached = false
  ) {
    const key = this.getID(uri, 'GET', options);
    if (!skipCached) {
      const r = this.cached[key];
      if (r) {
        console.log('use old cached');
        return r;
      }
    }

    console.log('new cached');
    const preOptions: RequestPromise.Options = {
      method: 'GET',
      headers: this.HEADERS,
      uri,
      ...(options || {})
    };
    const request = RequestPromise(uri, preOptions, callback);
    const requestCached = new RequestCached(request);
    this.saveCache(key, requestCached, skipCached);
    return requestCached;
  }

  post(
    uri: string,
    callback?: request.RequestCallback,
    options?: RequestPromise.Options,
    skipCached = false
  ) {
    const key = this.getID(uri, 'POST', options);
    if (!skipCached) {
      const r = this.cached[key];
      if (r) {
        return r;
      }
    }

    const preOptions: RequestPromise.Options = {
      method: 'POST',
      headers: this.HEADERS,
      uri,
      ...(options || {})
    };
    const request = RequestPromise(uri, preOptions, callback);
    const requestCached = new RequestCached(request);
    this.saveCache(key, requestCached, skipCached);
    return requestCached;
  }

  private saveCache(
    key: string,
    requestCached: RequestCached,
    skipCached: boolean
  ) {
    if (!skipCached) {
      this.popIfFull();
      this.cached[key] = requestCached;
    } else {
      requestCached.on('end', () => requestCached.disponse());
      requestCached.on('error', () => requestCached.disponse());
    }
  }

  remove(id: string) {
    delete this.cached[id];
  }

  popIds() {
    return this.ids.shift() || '';
  }

  pop() {
    const key = this.popIds();
    if (key) {
      const request = this.cached[key];
      delete this.cached[key];
      return request;
    }
    return null;
  }

  popIfFull() {
    if (this.size > this.MAX_REQUEST_SAVED) {
      return this.pop();
    }
    return null;
  }

  private getID(uri: string, method: string, options?: RequestPromise.Options) {
    return uri + JSON.stringify(options || {}) + method;
  }
}

export default RequestService;
