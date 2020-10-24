import Mongoose, { Document, Model, Schema } from 'mongoose';
import md5 from 'md5';
import JWT from 'jsonwebtoken';

export enum AuthType {
  FACEBOOK,
  WEB
}

export interface IUserDocument extends Document {
  username: string;
  password: string;
  avatar: string;
  display_name: string;
  email: string;
  phone: string;
  fb_id: string;
  auth_type: AuthType;
  is_complete_register: boolean;
  is_verify: boolean;
}

export interface IUserModal extends Model<IUserDocument> {
  login(username: string, password: string): unknown;
  loginByObject(user: IUserDocument): unknown;
  loginByFb(fb_id: string): unknown;
}

const UserSchema: Schema = new Schema({
  username: { type: String, max: 32, min: 3 },
  password: { type: String, max: 100 },
  avatar: { type: String },
  display_name: { type: String, max: 100 },
  email: { type: String, max: 320 },
  phone: { type: String, max: 20 },

  // facebook id linking or register
  fb_id: { type: String },

  // after register status is false
  // dont has detail email, phone, displayname, ...vvv
  is_complete_register: { type: Boolean, default: false },

  // account verified
  is_verify: { type: Boolean, default: false }
});

UserSchema.statics.loginByObject = async (user: IUserDocument) => {
  const id = user._id.toString();
  const password = user.password;
  const fb_id = user.fb_id;
  const obj = { id, fb_id, password };
  const token = JWT.sign(obj, process.env.AUTH_KEY || '10026');
  return {
    token,
    auth_type: user.auth_type,
    is_complete_register: user.is_complete_register,
    is_verify: user.is_verify
  };
};

UserSchema.statics.login = async (username: string, password: string) => {
  password = md5(password);
  const users = await ModelUser.find({ username, password });
  if (users.length) {
    return await ModelUser.loginByObject(users[0]);
  }
  return false;
};

UserSchema.statics.loginByFb = async (fb_id: string) => {
  const users = await ModelUser.find({ fb_id });
  if (users.length) {
    return await ModelUser.loginByObject(users[0]);
  }
  return false;
};

const ModelUser = Mongoose.model<IUserDocument, IUserModal>('User', UserSchema);

export default ModelUser;
