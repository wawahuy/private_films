import { Options, QueryTypes, Sequelize } from 'sequelize';
import { log } from '../core/log';
import RTServerFactory, { RTServerStatic } from '../schemas/rt_server';
import RTSegmentFactory, { RTSegmentStatic } from '../schemas/rt_segment';

/**
 * ******************** NOTE *************************
 * - Giải pháp realtime cached được đề xuất:
 *  + Redis: không chấp nhận, rất khó trong việc nâng cấp và thiết kế
 *  + SqlLite (:memory:): chấp nhận, kiểm tra cho thấy nó sử dụng không qua nhiều chi phí
 *
 * - Các kiểm tra cho thấy sequelize gây tốn chi phí Create gắp 3 lần so với query nguyên thủy của nó
 *    + Hướng giải quyết thay thế Create trở về nguyên thủy
 *    + Tình trạng: (chưa giải quyết)
 */
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
      // logging: (l) => log('[DBRT]', l),
      logging: false
    };
    this._db = new Sequelize('sqlite::memory:', options);
    Model.RTServer = await RTServerFactory(this._db);
    Model.RTSegment = await RTSegmentFactory(this._db);
  }
}

export default RealtimeDBService;
