import {Connection, Schema} from 'mongoose'

export interface IBaseMongoModel {
  db?: Connection
  modelName: string
  collectionName?: string
  schema: Schema
}

export interface ModelMetadata {
  identify: symbol | string
  target: any
}
