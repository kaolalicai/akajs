import '../../database'
import {Connection, Document, Schema} from 'mongoose'
import {inject, injectable} from 'inversify'
import {TYPES} from '../../cantainer'

@injectable()
export abstract class BaseModel<T extends Document> {
  @inject(TYPES.MONGO_DEFAULT_CONNECTION)
  protected db: Connection
  protected abstract modelName: string
  protected abstract schema: Schema

  build (collection?: string, config?) {
    if (!this.db) throw new Error('请注入 mongoose connection')
    this.schema.set('toObject', {getters: true, virtuals: true, minimize: false})
    this.schema.set('toJSON', {getters: true, virtuals: true, minimize: false})
    this.schema.set('timestamps', true)
    return this.db.model<T>(this.modelName, this.schema, collection || this.modelName)
  }
}
