import {container, autoIdentify, fixIdentifier} from '@akajs/ioc'
import {MongooseConnection, MongoConnectionKey} from './MongooseConnection'
import {Document, Model, Schema} from 'mongoose'
import {getModelsFromMetadata, getModelMetadata} from './utils/MetaData'
import {IBaseMongoModel, ITypeMongoOptions} from './interfaces/mongoose'
import {buildSchema} from '@typegoose/typegoose'

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
      } else {
        const op: ITypeMongoOptions = modelMetadata.options || {}
        if (op.db) {
          db = this.connection.dbs.get(MongoConnectionKey + op.db)
        }
        schema = buildSchema(Model, {})
        schema.set(modelMetadata.options as any)
        // _.defaults(op, modelMetadata.options)
        collectionName = op.collectionName || m.constructor.name
        modelName = op.modelName || m.constructor.name
      }
      if (!schema.get('toObject')) schema.set('toObject', {getters: true, virtuals: true, minimize: false})
      if (!schema.get('toJSON')) schema.set('toJSON', {getters: true, virtuals: true, minimize: false})
      if (!schema.get('timestamps')) schema.set('timestamps', true)
      const mongooseModel = db.model<Document>(modelName, schema, collectionName || modelName)
      let identifier = modelMetadata.identify
      if (identifier === undefined || identifier === null) {
        identifier = autoIdentify(modelMetadata.target)
      }
      if (!identifier.includes('model') && !identifier.includes('Model')) {
        identifier = identifier + 'Model'
      }
      container.bind(fixIdentifier(identifier)).toConstantValue(mongooseModel)
      container.bind<Model<Document>>(identifier).toConstantValue(mongooseModel)
    })
  }
}
