import {MongooseConnection} from './MongooseConnection'

const dbs = MongooseConnection.getInstance().dbs
const defaultCon = MongooseConnection.getInstance().defaultCon

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

export async function closeDB (callback) {
  await defaultCon.close(callback)
}

export async function clearDB () {
  for (let db of dbs.values()) {
    for (let model of Object.values(db.models)) {
      await (model as any).deleteMany({})
    }
  }
}

export async function initFixtureData (data: { model: string, items: any[] }[]) {
  if (!data.length) return
  for (const d of data) {
    let model = getModel(d.model)
    if (!model) throw new Error(' 不存在这个 Model ' + d.model)
    await model.create(d.items)
  }
}
