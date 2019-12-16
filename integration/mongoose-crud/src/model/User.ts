import {TypeMongoModel} from '@akajs/mongoose'
import {prop, ReturnModelType} from '@typegoose/typegoose'

// 可以指定 db 连接名
@TypeMongoModel(null, {db: 'db-name'})
export class User {
  @prop({index: true, required: true})
  phone: string
  @prop()
  name?: string
  @prop()
  count?: number
}

export type UserModel = ReturnModelType<typeof User>
