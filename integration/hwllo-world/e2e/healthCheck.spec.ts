import * as request from 'supertest'
import {app} from '../src/app'

describe('healthCheck.spec ', () => {
  let server

  before(async () => {
    server = app.getHttpServer()
    await app.init()
  })

  after(async () => {
    await app.close()
  })
  it('normal', async () => {
    await request(server)
      .get('/healthcheck/check')
      .expect(200)
  })

  it('edit server health status', async () => {
    await request(server)
      .get('/healthcheck/status/reset')
      .query({status: 'false'})
      .expect(200)
  })

  it('unable', async () => {
    await request(server)
      .get('/healthcheck/check')
      .expect(503)
  })
})
