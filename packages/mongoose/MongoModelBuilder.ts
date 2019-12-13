import {container} from '@akajs/ioc'
import {MongooseConnection} from './MongooseConnection'
import {Document, Model, Schema} from 'mongoose'
import {getModelsFromMetadata, getModelMetadata} from './utils/MetaData'
import {IBaseMongoModel, ITypeMongoOptions} from './interfaces/mongoose'
import {Typegoose} from 'typegoose'

MongooseConnection.getInstance().init()

function instanceOfIBaseMongoModel (object: any): object is IBaseMongoModel {
  return ('schema' in object)
}

export class MongoModelBuilder {
  private connection: MongooseConnection

  constructor () {
    this.connection = MongooseConnection.getInstance()
  }

  build () {
    // 找出注解的 class
    let constructors = getModelsFromMetadata()

    constructors.forEach((Model: any) => {
      const m = new Model()
      let modelMetadata = getModelMetadata(Model)
      // TODO 支持多 DB 连接
      let db = this.connection.defaultCon
      let modelName = ''
      let collectionName = ''
      let schema: Schema = null
      if (instanceOfIBaseMongoModel(m)) {
        schema = m.schema
        modelName = m.modelName
        collectionName = m.collectionName
      }
      if (m instanceof Typegoose) {
        const op: ITypeMongoOptions = modelMetadata.options || {}
        schema = m.buildSchema(Model, {})
        schema.set(modelMetadata.options as any)
        // _.defaults(op, modelMetadata.options)
        collectionName = op.collectionName || m.constructor.name
        modelName = op.modelName || m.constructor.name
      }
      // TODO 如果有值就不覆盖
      if (!schema.get('toObject')) schema.set('toObject', {getters: true, virtuals: true, minimize: false})
      if (!schema.get('toJSON')) schema.set('toJSON', {getters: true, virtuals: true, minimize: false})
      if (!schema.get('timestamps')) schema.set('timestamps', true)
      const mongooseModel = db.model<Document>(modelName, schema, collectionName || modelName)
      container.bind<Model<Document>>(modelMetadata.identify).toConstantValue(mongooseModel)
    })
  }
}
