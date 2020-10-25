import Mongoose, { Document, Model, Schema } from 'mongoose';

export enum EFilmStorage {
  DROPBOX,
  LOCAL
}

export interface IFilmStorage {
  type: EFilmStorage;
  link: string;
}

export interface IFilmSegment {
  typeStorage: EFilmStorage;
  name: string;
  link: string;
}

export interface IFilmEpisodes {
  name: string;
  segments: IFilmSegment[];
}

/***
 * Declare Schema
 */
export interface IFilmDocument extends Document {
  name: string | undefined;
  storage: IFilmStorage[];
  episodes: IFilmEpisodes[];
}

export interface IUserModal extends Model<IFilmDocument> {
  test(): void;
}

const FilmSchema: Schema = new Schema({
  name: { type: String },
  storage: [
    {
      type: { type: EFilmStorage, required: true },
      link: { type: String, required: true }
    }
  ],
  episodes: [
    {
      name: { type: String, required: true },
      segments: [
        {
          typeStorage: { type: EFilmStorage, required: true },
          name: { type: String, required: true },
          link: { type: String, required: true }
        }
      ]
    }
  ]
});

const ModelFilm = Mongoose.model<IFilmDocument, IUserModal>('User', FilmSchema);

export default ModelFilm;
