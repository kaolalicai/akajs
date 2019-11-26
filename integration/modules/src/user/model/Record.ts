import {Document, Model, Schema} from 'mongoose'
import {IBaseMongoModel, MongoModel} from '@akajs/mongoose'

export interface IRecord {
  phone: string
  name: string
  count: number
}

export interface IRecordModel extends IRecord, Document {
  // registerSuccess (): IRecordModelModel
}

export type RecordModel = Model<IRecordModel>

const schema: Schema = new Schema({
  phone: {type: String, index: true},
  name: {type: String},
  count: {type: Number}
})

@MongoModel('RecordModel')
export class Record implements IBaseMongoModel {
  modelName = 'Record'
  schema = schema
}
