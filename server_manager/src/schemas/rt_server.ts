import { BuildOptions, DataTypes, Model, Sequelize } from 'sequelize';

export interface RTServerRow {
  server_id?: number;
  server_name?: string;
  active?: boolean;
  net_in?: number;
  net_out?: number;
  speed_in?: number;
  speed_out?: number;
  stream_num?: number;
  last_seen?: number;
  cpu?: number;
  ram?: number;
  ram_max?: number;
  cached_size?: number;
}

export interface RTServerModel extends Model<RTServerRow>, RTServerRow {}

export class RTServer extends Model<RTServerModel, RTServerRow> {}

export type RTServerStatic = typeof Model & {
  new (value?: unknown, options0?: BuildOptions): RTServerModel;
};

export default async function RTServerFactory(
  sequelize: Sequelize
): Promise<RTServerStatic> {
  const model = <RTServerStatic>sequelize.define(
    'rtserver',
    {
      server_id: {
        type: DataTypes.INTEGER,
        primaryKey: true
      },
      server_name: {
        type: DataTypes.STRING
      },
      active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      },
      net_in: {
        type: DataTypes.BIGINT,
        allowNull: true
      },
      net_out: {
        type: DataTypes.BIGINT,
        allowNull: true
      },
      speed_in: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      speed_out: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      stream_num: {
        type: DataTypes.SMALLINT,
        allowNull: true
      },
      last_seen: {
        type: DataTypes.BIGINT,
        allowNull: true
      },
      cpu: {
        type: DataTypes.SMALLINT,
        allowNull: true
      },
      ram: {
        type: DataTypes.BIGINT,
        allowNull: true
      },
      ram_max: {
        type: DataTypes.BIGINT,
        allowNull: true
      },
      cached_size: {
        type: DataTypes.BIGINT,
        allowNull: true
      }
    },
    {
      indexes: [
        {
          fields: ['cached_size'],
          unique: false
        }
      ]
    }
  );

  await model.sync({ force: true });

  return Promise.resolve(model);
}
