import * as _ from 'lodash'
import * as config from 'config'

export type MongoConfigs = {
  url: string,
  name: string,
  options?: {
    useNewUrlParser: boolean,
    useUnifiedTopology: boolean
  }
}

export function parseConfig (): { mongoConfigs: MongoConfigs[], debugMongoose: boolean } {
  let mongoConfigs: MongoConfigs[]
  try {
    // 兼容旧结构
    if (config.has('database.mongodb')) {
      mongoConfigs = config.get('database.mongodb')
    } else {
      mongoConfigs = config.get('mongodb.connections')
    }
  } catch (e) {
    throw new Error('mongodb config 不能为空')
  }
  if (_.isEmpty(mongoConfigs)) throw new Error('mongodb config 不能为空')
  let debugMongoose = false
  try {
    // 兼容旧结构
    if (config.has('database.mongoDebug')) {
      debugMongoose = config.get('database.mongoDebug')
    }
    if (config.has('mongodb.debug')) {
      debugMongoose = config.get('mongodb.debug')
    }

  } catch (e) {
    throw new Error('mongodb debug config 不正确')
  }
  return {mongoConfigs, debugMongoose}
}
