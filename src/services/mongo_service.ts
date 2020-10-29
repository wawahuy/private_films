import Mongoose, { Schema } from 'mongoose';
import { log } from '../core/log';

class MongoService {
  private static _instance: MongoService;

  static get instance() {
    if (!MongoService._instance) {
      MongoService._instance = new MongoService();
    }
    return MongoService._instance;
  }

  private _clients: Mongoose.Mongoose | undefined;

  constructor() {}

  public get clients() {
    return this._clients;
  }

  private onConnect() {
    log('[Mongo]', process.env.MONGO_URI);
    log('[Mongo] connection!');
  }

  private onError(err: Mongoose.Error) {
    log('[Mongo] error!');
    log(err);
  }

  public async establish() {
    this._clients = await Mongoose.connect(
      process.env.MONGO_URI as string,
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
        useCreateIndex: true
      },
      (err) => {
        if (err) {
          this.onError(err);
        } else {
          this.onConnect();
        }
      }
    );
    Mongoose.Promise = global.Promise;
  }
}

export default MongoService;
