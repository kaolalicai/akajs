import {TypeMongoModel} from '@akajs/mongoose'
import {prop, ReturnModelType} from '@typegoose/typegoose'

@TypeMongoModel()
export class Account {
  @prop({index: true, required: true})
  phone: string
  @prop()
  name?: string
  @prop()
  count?: number
}

export type AccountModel = ReturnModelType<typeof Account>
