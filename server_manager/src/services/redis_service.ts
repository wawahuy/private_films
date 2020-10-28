import { rejects } from 'assert';
import redis from 'redis';
import { log } from '../core/log';

class RedisService {
  private static _instance: RedisService;

  static get instance() {
    if (!RedisService._instance) {
      RedisService._instance = new RedisService();
    }
    return RedisService._instance;
  }

  private _client!: redis.RedisClient;

  constructor() {}

  get client() {
    return this._client;
  }

  private onConnect() {
    log('[Redis]', process.env.REDIS_HOST + ':' + process.env.REDIS_PORT);
    log('[Redis] connection!');
  }

  private onError(error: Error) {
    log('[Redis] error!');
    log(error);
  }

  public async establish() {
    return new Promise((resolve, reject) => {
      this._client = redis.createClient(
        (process.env.REDIS_PORT as unknown) as number,
        process.env.REDIS_HOST,
        {
          password: process.env.REDIS_PWD
        }
      );
      this._client.on('connect', () => {
        this.onConnect();
        resolve();
      });
      this._client.on('error', (err) => {
        this.onError(err);
        reject(err);
      });
    });
  }
}

export default RedisService;
