import { BuildOptions, DataTypes, Model, Sequelize } from 'sequelize';

export interface RTSegmentRow {
  server_id: number;
  film_id: string;
  segment_id: number;
  quality_code: number;
  position_cached: number;
}

export interface RTSegmentModel extends Model<RTSegmentRow>, RTSegmentRow {}

export class RTSegment extends Model<RTSegmentModel, RTSegmentRow> {}

export type RTSegmentStatic = typeof Model & {
  new (value?: unknown, options0?: BuildOptions): RTSegmentModel;
};

export default async function RTSegmentFactory(
  sequelize: Sequelize
): Promise<RTSegmentStatic> {
  const model = <RTSegmentStatic>sequelize.define('rtsegment', {
    server_id: {
      type: DataTypes.INTEGER
    }
  });

  await model.sync({ force: true });

  return Promise.resolve(model);
}
