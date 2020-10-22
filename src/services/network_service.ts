import request, { Headers } from 'request';
import RequestPromise from 'request-promise';
import { IRequest, RequestCached } from '../core/network';

export interface ICached {
  [key: string]: IRequest;
}

export interface IKeyPair {
  [key: string]: unknown;
}

class NetworkService {
  readonly MAX_REQUEST_SAVED = 100 * 1024 * 1024;
  readonly HEADERS: Headers = {
    'User-Agent': `Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.75 Mobile Safari/537.36`
  };

  private cached: ICached = {};
  private sizeByte = 0;

  private static _instance: NetworkService;
  static get instance() {
    if (!NetworkService._instance) {
      NetworkService._instance = new NetworkService();
    }
    return NetworkService._instance;
  }

  get size() {
    return this.sizeByte;
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
        // console.log('use old cached');
        return r;
      }
    }

    // console.log('new cached');
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
      requestCached.once('end', () => {
        this.sizeByte += requestCached.getByteLength();
      });
      requestCached.once('abort', () => this.remove(key));
      requestCached.once('error', () => this.remove(key));
    } else {
      requestCached.once('end', () => requestCached.disponse());
      requestCached.once('error', () => requestCached.disponse());
      requestCached.once('abort', () => requestCached.disponse());
    }
  }

  remove(id: string) {
    if (this.cached[id]) {
      this.sizeByte -= this.cached[id].getByteLength();
    }
    delete this.cached[id];
  }

  popIds() {
    return this.ids.shift() || '';
  }

  pop() {
    const key = this.popIds();
    if (key) {
      const request = this.cached[key];
      this.remove(key);
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

export default NetworkService;
