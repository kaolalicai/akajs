import * as request from 'supertest'
import {routerPrefix} from '@akajs/core'
import {app} from '../src/app'

describe('Mongoose crud', () => {
  let server

  beforeEach(async () => {
    server = app.getHttpServer()
    await app.init()
  })

  it(`create user`, () => {
    return request(server)
      .post(routerPrefix + '/user')
      .send({
        phone: '123',
        name: 'hali'
      })
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
