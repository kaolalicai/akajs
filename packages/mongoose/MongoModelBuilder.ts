import {container} from '@akajs/core'
import {MongooseConnection} from './MongooseConnection'
import {Document, Model} from 'mongoose'
import {getModelsFromMetadata, getModelsFromContainer, getModelMetadata} from './utils/MetaData'
import {TYPE, DUPLICATED_CONTROLLER_NAME} from './constant'
import {IBaseMongoModel} from './interfaces/mongoose'

MongooseConnection.getInstance().init()

export class MongoModelBuilder {
  private connection: MongooseConnection

  constructor () {
    this.connection = MongooseConnection.getInstance()
  }

  build () {
    // 把 Model 在容器里绑定
    let constructors = getModelsFromMetadata()

    constructors.forEach((constructor) => {
      const name = constructor.name

      if (container.isBoundNamed(TYPE.Model, name)) {
        throw new Error(DUPLICATED_CONTROLLER_NAME(name))
      }

      container.bind(TYPE.Model)
        .to(constructor)
        .whenTargetNamed(name)
    })

    // 从容器里取出所有 Model，然后注册 mongoose
    let models = getModelsFromContainer(container, false)

    models.forEach((model: IBaseMongoModel) => {
      const m: IBaseMongoModel = container.resolve(model.constructor as any)
      if (!m.db) {
        m.db = this.connection.defaultCon
      }
      let modelMetadata = getModelMetadata(model.constructor)
      m.schema.set('toObject', {getters: true, virtuals: true, minimize: false})
      m.schema.set('toJSON', {getters: true, virtuals: true, minimize: false})
      m.schema.set('timestamps', true)
      const mongooseModel = m.db.model<Document>(m.modelName, m.schema, m.collectionName || m.modelName)
      container.bind<Model<Document>>(modelMetadata.identify).toConstantValue(mongooseModel)
    })
  }
}
