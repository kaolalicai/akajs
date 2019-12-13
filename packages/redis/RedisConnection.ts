import {logger} from '@akajs/utils'
import * as _ from 'lodash'
import * as config from 'config'
import * as redis from 'ioredis'

(redis as any).Promise = Promise

export class RedisConnection {

  private _client: redis.Redis
  static instance: RedisConnection

  get client (): redis.Redis {
    if (!this._client) this.init()
    return this._client
  }

  static getInstance () {
    if (!this.instance) {
      this.instance = new RedisConnection()
    }
    return this.instance
  }

  init () {
    let redisConfig = null
    try {
      redisConfig = config.get('database.redis')
    } catch (e) {
      throw new Error('config database.redis 不能为空')
    }
    if (_.isEmpty(redisConfig)) throw new Error('config database.redis 不能为空')
    logger.info(redisConfig)
    const con = this.createConnection(redisConfig)
    if (!this._client) {
      this._client = con
    }
  }

  createConnection (option?: redis.RedisOptions) {
    const client = new redis(option)
    client.on('error', err => {
      err.message = `[option]${err.message}`
      logger.error(err)
    })

    client.on('disconnected', () => {
      logger.error(`[option] ${option.host}:${option.port} disconnected`)
    })

    client.on('connected', () => {
      logger.info(`[option] ${option.host}:${option.port} connected successfully`)
    })

    client.on('reconnected', () => {
      logger.info(`[option] ${option.host}:${option.port} reconnected successfully`)
    })
    return client
  }
}
