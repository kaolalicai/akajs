import {Container} from 'inversify'

export const container = new Container()

export const TYPES = {
  MONGO_DEFAULT_CONNECTION: Symbol.for('MONGO_DEFAULT_CONNECTION')
}
