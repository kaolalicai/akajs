import {prop} from '@typegoose/typegoose'

export class BaseLog {
  @prop()
  time: number
  @prop({sparse: true})
  userId: string
  @prop({sparse: true})
  orderId: string
  @prop({index: true, enum: ['in', 'out'], required: true})
  type: string
  @prop({index: true})
  server: string
  @prop()
  useTime: number
  @prop({index: true})
  interfaceName: string
  @prop({index: true})
  url: string
  @prop()
  httpMethod: string
  @prop()
  body: object
  @prop()
  response?: object
  @prop()
  responseAsync?: object
}
