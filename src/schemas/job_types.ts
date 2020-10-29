import Mongoose, { Document, Model, Schema } from 'mongoose';
import { IJobTypes } from '../models/job';

/***
 * Declare Schema
 */
export interface IJobtypesDocument extends Document, IJobTypes {}

export interface IJobTypesModal extends Model<IJobtypesDocument> {
  test(): void;
}

const JobTypesSchema: Schema = new Schema(
  {
    job_id: {
      type: Schema.Types.Number,
      required: true,
      index: { unique: true },
      min: 10000
    },
    name: { type: Schema.Types.String, required: true },
    priority: { type: Schema.Types.Number, default: 0 },
    jobs: { type: Schema.Types.Array }
  },
  { timestamps: true, _id: false }
);

const ModelJobTypes = Mongoose.model<IJobtypesDocument, IJobTypesModal>(
  'job_types',
  JobTypesSchema
);

export default ModelJobTypes;
