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
      logging: log.bind(null, '[DBRT]')
    };
    this._db = new Sequelize('sqlite::memory:', options);
    Model.RTServer = await RTServerFactory(this._db);
    Model.RTSegment = await RTSegmentFactory(this._db);

    Model.RTSegment.belongsTo(Model.RTServer, {
      foreignKey: 'server_id'
    });

    await Model.RTServer.create({
      server_id: 1,
      server_name: '123'
    });

    await Model.RTServer.create({
      server_id: 2,
      server_name: '123'
    });

    await Model.RTSegment.create({
      server_id: 1,
      film_id: 111,
      segment_id: 0
    });
  }
}

export default RealtimeDBService;
