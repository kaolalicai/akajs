import {TypeMongoModel} from '@akajs/mongoose'
import {ReturnModelType} from '@typegoose/typegoose'

@TypeMongoModel()
export class Record {
  phone: string
  name: string
  count: number
}

export type RecordModel = ReturnModelType<typeof Record>
