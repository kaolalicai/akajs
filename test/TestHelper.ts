process.env.NODE_ENV = 'test'
console.log('current env', process.env.NODE_ENV)
import {request} from './helper/request'
import {clearDB, closeDB, initData} from './helper/database'

const prefix = '/api/v1'

const fixtureStatus = new Map()

// before(async function () {
//   await flushRedis()
// })

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
