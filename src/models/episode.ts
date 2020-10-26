import Mongoose, { Document, Model, Schema } from 'mongoose';

export enum EEpisodeStorage {
  DROPBOX,
  LOCAL
}

export interface IEpisodeSegment {
  name: string;
  link: string;
}

/***
 * Declare Schema
 */
export interface IEpisodesDocument extends Document {
  filmId: Mongoose.Types.ObjectId;
  link: string;
  episode: string;
  storage: EEpisodeStorage;
  segments: IEpisodeSegment[];
}

export interface IEpisodesModal extends Model<IEpisodesDocument> {
  test(): void;
}

const FilmSchema: Schema = new Schema(
  {
    filmId: { type: Schema.Types.ObjectId, required: true, index: true },
    storage: { type: EEpisodeStorage, required: true, index: true },
    episode: { type: String, required: true, index: true },
    link: { type: String, required: true },
    segments: [
      {
        name: { type: String, required: true },
        link: { type: String, required: true }
      }
    ]
  },
  { timestamps: true }
);

const ModelEpisodes = Mongoose.model<IEpisodesDocument, IEpisodesModal>('episodes', FilmSchema);

export default ModelEpisodes;
