import { Request } from 'aws-sdk';
import { EventEmitter } from 'events';
import { boolean, extend } from 'joi';
import LibRequest from 'request';
import { Readable, Transform } from 'stream';

export interface IRequest {
  createStream(): Transform;
  createPromise(): Promise<Buffer>;
  isDone(): boolean;
  abort(): unknown;
  getByteLength(): number;
}

export interface IRequestPromise {
  resolve: (data: Buffer) => unknown;
  reject: (error: Error) => unknown;
}

export class RequestTransform extends Transform {
  _transform(chunk: Buffer[], encoding: string, cb: () => unknown) {
    this.push(chunk);
    cb();
  }
}

export class RequestCached extends EventEmitter implements IRequest {
  private request: LibRequest.Request | undefined;
  private data: Buffer[] = [];
  private _sizeByte = 0;
  private streams: RequestTransform[] = [];
  private promise: IRequestPromise[] = [];
  private isEnd = false;

  constructor(request: LibRequest.Request) {
    super();
    this.request = request;
    this.request.on('data', this.onData.bind(this));
    this.request.on('complete', this.onEnd.bind(this));
    this.request.on('error', this.onError.bind(this));
    this.request.on('abort', this.onAbort.bind(this));
  }

  private onData(chunk: Buffer) {
    this._sizeByte += Buffer.byteLength(chunk);
    this.data.push(chunk);
    this.streams.map((stream: RequestTransform) => stream.write(chunk));
  }

  private onEnd() {
    this.isEnd = true;
    this.request = undefined;
    this.data = [Buffer.concat(this.data)];
    this.streams.map((stream: RequestTransform) => stream.end());
    this.promise.map((pr: IRequestPromise) => pr.resolve(this.data[0]));
    this.emit('end');
  }

  private onError(err: Error) {
    this.streams.map((stream: RequestTransform) => stream.emit('error', err));
    this.promise.map((pr: IRequestPromise) => pr.reject(err));
    this.request = undefined;
    this.emit('error', err);
  }

  private onAbort() {
    const error = new Error('abort');
    this.promise.map((pr: IRequestPromise) => pr.reject(error));
    this.streams.map((stream: RequestTransform) =>
      stream?.emit('abort', error)
    );
    this.emit('abort');
    this.disponse();
  }

  public createPromise(): Promise<Buffer> {
    return new Promise<Buffer>((resolve, reject) => {
      if (!this.isEnd) {
        this.promise.push({ resolve, reject });
      } else {
        resolve(this.data[0]);
      }
    });
  }

  public createStream() {
    const stream = new RequestTransform();
    this.data.map((chunk) => stream.write(chunk));
    if (!this.isEnd) {
      this.streams.push(stream);
    } else {
      stream.end();
    }
    return stream;
  }

  public abort() {
    this.request?.abort();
  }

  public disponse() {
    this.data = [];
    this._sizeByte = 0;
    this.request = undefined;
  }

  public isDone() {
    return this.isEnd;
  }

  public getByteLength() {
    return this._sizeByte;
  }
}
