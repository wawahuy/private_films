import { BuildOptions, DataTypes, Model, Sequelize } from 'sequelize';

export interface RTServerRow {
  server_id: number;
  server_name: string;
  net_in: number;
  net_out: number;
  speed_in: number;
  speed_out: number;
  stream_num: number;
  last_seen: number;
  cpu: number;
  ram: number;
  ram_max: number;
  cached_size: number;
}

export interface RTServerModel extends Model<RTServerRow>, RTServerRow {}

export class RTServer extends Model<RTServerModel, RTServerRow> {}

export type RTServerStatic = typeof Model & {
  new (value?: unknown, options0?: BuildOptions): RTServerModel;
};

export default async function RTServerFactory(
  sequelize: Sequelize
): Promise<RTServerStatic> {
  const model = <RTServerStatic>sequelize.define('rtserver', {
    server_id: {
      type: DataTypes.INTEGER,
      primaryKey: true
    },
    server_name: {
      type: DataTypes.STRING
    },
    net_in: {
      type: DataTypes.BIGINT
    },
    net_out: {
      type: DataTypes.BIGINT
    },
    speed_in: {
      type: DataTypes.INTEGER
    },
    speed_out: {
      type: DataTypes.INTEGER
    },
    stream_num: {
      type: DataTypes.SMALLINT
    },
    last_seen: {
      type: DataTypes.BIGINT
    },
    cpu: {
      type: DataTypes.SMALLINT
    },
    ram: {
      type: DataTypes.BIGINT
    },
    ram_max: {
      type: DataTypes.BIGINT
    },
    cached_size: {
      type: DataTypes.BIGINT
    }
  });

  await model.sync({ force: true });

  return Promise.resolve(model);
}
