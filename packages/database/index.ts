import {container, TYPES} from '../cantainer'
import {dbs, defaultConnection} from './MongooseConnection'
import {Connection} from 'mongoose'

container.bind(TYPES.MONGO_DEFAULT_CONNECTION).toConstantValue(defaultConnection)
for (let [key, value] of dbs) {
  container.bind<Connection>(Symbol.for(key)).toConstantValue(value)
}

export * from './DadabaseHelper'
