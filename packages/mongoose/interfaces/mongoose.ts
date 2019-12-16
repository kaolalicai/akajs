import {Schema, SchemaOptions} from 'mongoose'

export interface IBaseMongoModel {
  db?: string
  modelName: string
  collectionName?: string
  schema: Schema
}

export interface ITypeMongoOptions extends SchemaOptions {
  db?: string
  modelName?: string
  collectionName?: string
}

export interface ModelMetadata {
  identify: string
  options?: ITypeMongoOptions
  target: any
}
