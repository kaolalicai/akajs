process.env.NODE_ENV = 'test'
console.log('current env', process.env.NODE_ENV)
import {routerPrefix} from '@akajs/web'
import {request} from './helper/request'
import {clearDB, closeDB, initData} from './helper/database'

const prefix = routerPrefix

const fixtureStatus = new Map()

beforeEach(async function () {
  const file = (this.currentTest as any).file
  if (fixtureStatus.has(file)) return
  console.log('currentTest file', file)
  await clearDB()
  await initData(file)
  fixtureStatus.set(file, true)
})

after((done) => {
  closeDB(done)
  console.info(' 测试结束 cleanAll nock')
})

export {request, prefix}
