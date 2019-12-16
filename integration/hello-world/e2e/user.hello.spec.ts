import * as request from 'supertest'
import {routerPrefix} from '@akajs/web'
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

  it(`should return error message`,() => {
    return request(server)
        .post(routerPrefix + '/user/testDto')
        .send({name: ''})
        .expect(200)
        .expect({
          code: 1,
          message: 'name can not be empty'
        })
  })

  afterEach(async () => {
    await app.close()
  })
})
