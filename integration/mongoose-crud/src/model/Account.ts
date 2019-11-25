import {TypeMongoModel} from '@akajs/mongoose'
import {prop, Typegoose, ModelType} from 'typegoose'

@TypeMongoModel('AccountModel')
export class Account extends Typegoose {
  @prop({index: true, required: true})
  phone: string
  @prop()
  name?: string
  @prop()
  count?: number
}

export type AccountModel = ModelType<Account>
