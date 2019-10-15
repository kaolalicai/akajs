import {Document, Model, Schema} from 'mongoose'
import {IBaseMongoModel, MongoModel} from '@akajs/mongoose'

export interface IUser {
  phone: string
  name: string
}

export interface IUserModel extends IUser, Document {
  // registerSuccess (): IUserModelModel
}

export type UserModel = Model<IUserModel>

const schema: Schema = new Schema({
  phone: {type: String, index: true},
  name: {type: String}
})

@MongoModel(Symbol.for('UserModel'))
export class User implements IBaseMongoModel {
  modelName = 'User'
  schema = schema
}
