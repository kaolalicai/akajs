import * as request from 'supertest'
import {Application} from '@akajs/web'

describe('healthCheck.spec ', () => {
  let app
  let server
  before(async function () {
    app = new Application({})
    server = app.getHttpServer()
    await app.init()
  })
  it('normal', async () => {
    await request(server)
      .get('/healthcheck/check')
      .expect(200)
    await app.close()
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
    await app.close()
  })
})
