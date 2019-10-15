import * as config from 'config'
import {logger} from '../utils'
import * as mongoose from 'mongoose'

(mongoose as any).Promise = Promise
const DEBUG_FLAG = config.get('database.mongoDebug')
mongoose.set('debug', DEBUG_FLAG)

function createConnection (url, options = {}) {
  const db = mongoose.createConnection(url, options)
  db.on('error', err => {
    err.message = `[mongoose]${ err.message }`
    logger.error(err)
  })

  db.on('disconnected', () => {
    logger.error(`[mongoose] ${ url } disconnected`)
  })

  db.on('connected', () => {
    logger.info(`[mongoose] ${ url } connected successfully`)
  })

  db.on('reconnected', () => {
    logger.info(`[mongoose] ${ url } reconnected successfully`)
  })
  return db
}

let dbs: Map<string, mongoose.Connection> = new Map()
let defaultConnection: mongoose.Connection = null
const mongoConfigs = config.get('database.mongodb')
for (let c of mongoConfigs) {
  const con = createConnection(c.url, c.options)
  if (!defaultConnection) defaultConnection = con
  dbs.set('MongoConnection-' + c.name, con)
}

export {dbs, defaultConnection}
