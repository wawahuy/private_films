import { timeStamp } from 'console';
import { BuildOptions, DataTypes, Model, Sequelize } from 'sequelize';
import { RTServerStatic } from './rt_server';

export interface RTSegmentRow {
  server_id?: number;
  film_id?: number;
  segment_id?: number;
}

export interface RTSegmentModel extends Model<RTSegmentRow>, RTSegmentRow {}

export class RTSegment extends Model<RTSegmentModel, RTSegmentRow> {}

export type RTSegmentStatic = typeof Model & {
  new (value?: unknown, options0?: BuildOptions): RTSegmentModel;
};

export default async function RTSegmentFactory(
  sequelize: Sequelize
): Promise<RTSegmentStatic> {
  const model = sequelize.define(
    'rtsegment',
    {
      server_id: {
        type: DataTypes.INTEGER,
        references: {
          model: 'rtservers',
          key: 'server_id'
        }
      },
      film_id: {
        type: DataTypes.INTEGER
      },
      segment_id: {
        type: DataTypes.INTEGER
      }
    },
    {
      timestamps: false,
      indexes: [
        {
          fields: ['server_id'],
          unique: false
        },
        {
          fields: ['film_id'],
          unique: false
        },
        {
          fields: ['server_id', 'film_id'],
          unique: false
        },
        {
          fields: ['film_id', 'segment_id'],
          unique: false
        }
      ]
    }
  );

  await model.sync({ force: true });

  return Promise.resolve(<RTSegmentStatic>model);
}
