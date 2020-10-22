import { EventEmitter } from 'events';
import { extend } from 'joi';
import LibRequest from 'request';
import { Readable, Transform } from 'stream';

type DataType = Buffer[];

export interface IRequest {
  createStream(): Transform;
  createPromise(): Promise<Buffer>;
}

export interface IRequestPromise {
  resolve: (data: Buffer) => unknown;
  reject: (error: Error) => unknown;
}

export class RequestTransform extends Transform {
  _transform(chunk: DataType, encoding: string, cb: () => unknown) {
    this.push(chunk);
    cb();
  }
}

export class RequestCached extends EventEmitter implements IRequest {
  private request: LibRequest.Request | undefined;
  private data: DataType = [];
  private size = 0;
  private streams: RequestTransform[] = [];
  private promise: IRequestPromise[] = [];
  private isEnd = false;

  constructor(request: LibRequest.Request) {
    super();
    this.request = request;
    this.request.on('data', this.onData.bind(this));
    this.request.on('complete', this.onEnd.bind(this));
    this.request.on('error', this.onError.bind(this));
  }

  private onData(chunk: Buffer) {
    this.size += chunk.length;
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

  public disponse() {
    this.data = [];
    this.size = 0;
    this.request = undefined;
  }
}
