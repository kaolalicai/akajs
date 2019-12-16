import * as request from 'supertest'
import {routerPrefix} from '@akajs/web'
import {expect} from 'chai'
import {app} from '../src/app'

describe('middleware.spec 中间件测试 ', () => {
  let server

  before(async () => {
    server = app.getHttpServer()
    await app.init()
  })

  it(`inject header from controller middleware`, async () => {
    const res = await request(server)
      .get(routerPrefix + '/mid/get')
      .expect(200)
    expect(res.header).to.have.own.property('kalengo')
    expect(res.header.kalengo).equal('inject form middleware')
  })

  it(`inject value from router middleware`, async () => {
    const {body} = await request(server)
      .get(routerPrefix + '/mid/get')
      .expect(200)
    expect(body.data).to.deep.equal({
      'info': 'inject from router middleware',
      'name': 'hello'
    })
  })

  after(async () => {
    await app.close()
  })
})
