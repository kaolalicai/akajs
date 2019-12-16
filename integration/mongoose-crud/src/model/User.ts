import {TypeMongoModel} from '@akajs/mongoose'
import {prop, ReturnModelType} from '@typegoose/typegoose'

@TypeMongoModel('UserModel')
export class User {
  @prop({index: true, required: true})
  phone: string
  @prop()
  name?: string
  @prop()
  count?: number
}

export type UserModel = ReturnModelType<typeof User>
