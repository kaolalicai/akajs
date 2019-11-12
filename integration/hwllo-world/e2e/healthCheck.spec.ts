import * as request from 'supertest'
import {Application} from '@akajs/core'
import {AppError} from '@akajs/utils'
import {expect} from 'chai'

describe('healthCheck.spec ', () => {
  let app
  let server
  it('normal',async () => {
    app = new Application({})
    server = app.getHttpServer()
    await app.init()
    await request(server)
            .get('/healthcheck/check')
            .expect(200)
    await app.close()
  })

  it('edit server health status',async () => {
    app = new Application({})
    server = app.getHttpServer()
    await app.init()
    await request(server)
        .get('/healthcheck/status/reset')
        .query({status: 'false'})
        .expect(200)
  })

  it('unable',async () => {
    await request(server)
        .get('/healthcheck/check')
        .expect(503)
    await app.close()
  })
})
