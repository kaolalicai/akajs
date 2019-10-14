import {container, TYPES} from '../cantainer'
import {Connection} from 'mongoose'
import {dbs} from './MongooseConnection'

const defaultCon: Connection = container.get(TYPES.MONGO_DEFAULT_CONNECTION)

export function getConnections () {
  return dbs.values()
}

export function getModel (str) {
  let model = null
  for (let db of dbs.values()) {
    if (db.models[str]) {
      model = db.models[str]
      break
    }
  }
  return model
}

export function closeDB (callback) {
  closeMongodb(callback)
}

export function closeMongodb (callback) {
  defaultCon.close(callback)
}

export async function clearDB () {
  await clearMongodb()
  await clearRedis()
}

export async function clearMongodb () {
  for (let db of dbs.values()) {
    for (let model of Object.values(db.models)) {
      await (model as any).deleteMany({})
    }
  }
}

export async function clearRedis () {
  // TODO
}

export async function initFixtureData (data: { model: string, items: any[] }[]) {
  if (!data.length) return
  for (const d of data) {
    let model = getModel(d.model)
    if (!model) throw new Error(' 不存在这个 Model ' + d.model)
    await model.create(d.items)
  }
}
