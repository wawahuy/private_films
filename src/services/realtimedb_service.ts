import { Options, Sequelize } from 'sequelize';
import { log } from '../core/log';
import RTServerFactory, { RTServerStatic } from '../schemas/rt_server';
import RTSegmentFactory, { RTSegmentStatic } from '../schemas/rt_segment';

export interface RTSchema {
  RTServer?: RTServerStatic;
  RTSegment?: RTSegmentStatic;
}

export const Model: RTSchema = {};

class RealtimeDBService {
  private static _instance: RealtimeDBService;

  static get instance() {
    if (!RealtimeDBService._instance) {
      RealtimeDBService._instance = new RealtimeDBService();
    }
    return RealtimeDBService._instance;
  }

  private _db!: Sequelize;

  constructor() {}

  public get db() {
    return this._db;
  }

  public async establish() {
    const options: Options = {
      logging: false
    };
    this._db = new Sequelize('sqlite:inmemory', options);
    Model.RTServer = await RTServerFactory(this._db);
    Model.RTSegment = await RTSegmentFactory(this._db);
  }
}

export default RealtimeDBService;
