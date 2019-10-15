import * as request from 'supertest'
import {routerPrefix} from '@akajs/core'
import {app} from '../src/app'

describe('Hello world ', () => {
  let server

  beforeEach(async () => {
    server = app.getHttpServer()
    await app.init()
  })

  it(`should return name`, () => {
    return request(server)
      .get(routerPrefix + '/user/hello/nick')
      .expect(200)
      .expect({
        code: 0,
        message: 'hello nick'
      })
  })

  afterEach(async () => {
    await app.close()
  })
})
