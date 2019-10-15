import {container} from '@akajs/core'
import {logger} from '@akajs/utils'
import * as _ from 'lodash'
import * as config from 'config'
import * as mongoose from 'mongoose'
import {Connection} from 'mongoose'
import {TYPE} from './constant'

(mongoose as any).Promise = Promise

export class MongooseConnection {
  get defaultCon (): Connection {
    return this._default
  }

  get dbs (): Map<string, Connection> {
    return this._dbs
  }

  private _default: Connection
  private _dbs: Map<string, Connection> = new Map<string, Connection>()
  static instance: MongooseConnection

  static getInstance () {
    if (!this.instance) {
      this.instance = new MongooseConnection()
    }
    return this.instance
  }

  init () {
    let mongoConfigs = null
    try {
      mongoConfigs = config.get('mongodb.connections')
    } catch (e) {
      throw new Error('mongodb config 不能为空')
    }
    if (_.isEmpty(mongoConfigs)) throw new Error('mongodb config 不能为空')

    const DEBUG_FLAG = config.get('mongodb.debug')
    mongoose.set('debug', DEBUG_FLAG)

    for (let c of mongoConfigs) {
      const con = this.createConnection(c.url, c.options)
      if (!this._default) {
        this._default = con
        container.bind(TYPE.DEFAULT_CONNECTION).toConstantValue(con)
      }
      let key = 'MongoConnection-' + c.name
      this._dbs.set(key, con)
      container.bind<Connection>(Symbol.for(key)).toConstantValue(con)
    }
  }

  createConnection (url, options = {}) {
    const db = mongoose.createConnection(url, options)
    db.on('error', err => {
      err.message = `[mongoose]${err.message}`
      logger.error(err)
    })

    db.on('disconnected', () => {
      logger.error(`[mongoose] ${url} disconnected`)
    })

    db.on('connected', () => {
      logger.info(`[mongoose] ${url} connected successfully`)
    })

    db.on('reconnected', () => {
      logger.info(`[mongoose] ${url} reconnected successfully`)
    })
    return db
  }
}
