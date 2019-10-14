import {Document, Model, Schema} from 'mongoose'
import {BaseModel, injectable} from '../../src/'

export interface IUser {
  userId: string
  phone: string
  name: string
}

export interface IUserModel extends IUser, Document {
  // registerSuccess (): IUserModelModel
}

export type UserModel = Model<IUserModel>

const schema: Schema = new Schema({
  userId: {type: String, index: true},
  phone: {type: String},
  name: {type: String}
})

@injectable()
export class User extends BaseModel<IUserModel> {
  protected modelName = 'User'
  protected schema = schema
}
