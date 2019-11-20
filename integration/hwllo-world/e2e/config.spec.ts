import * as request from 'supertest'
import * as sinon from 'sinon'
import {routerPrefix, Application} from '@akajs/core'

describe('config.spec 配置测试', () => {
  before(async () => {
    sinon.stub(Application.prototype,'buildRouters').returns({})
  })

  after(async () => {
    sinon.restore()
  })
  it('formatResponse false return ctx.body', async () => {
    let app = new Application({formatResponse: false, autoRequire: false})
    app.app.use(async (ctx, next) => {
      ctx.body = 'success'
    })
    let server = app.getHttpServer()
    await app.init()
    await request(server)
      .get(routerPrefix + '/user/hello/nick')
      .expect(200)
      .expect('success')
    await app.close()
  })

  it('formatResponse true return to ctx.body.data', async () => {
    let app = new Application({assembleParameters: true, autoRequire: false})
    app.app.use(async (ctx, next) => {
      ctx.body = 'success'
    })
    let server = app.getHttpServer()
    await app.init()
    await request(server)
      .get(routerPrefix + '/user/hello/nick')
      .expect(200)
      .expect({code: 0, 'message': 'success'})
    await app.close()
  })

  it('assembleParameters false', async () => {
    let app = new Application({assembleParameters: false, formatResponse: false, autoRequire: false})
    app.app.use(async (ctx, next) => {
      ctx.body = {parameters: ctx.parameters}
    })
    let server = app.getHttpServer()
    await app.init()
    await request(server)
      .post(routerPrefix + '/user/hello?name=deo')
      .send({parameters: {message: 'hello'}})
      .expect(200)
      .expect({})
    await app.close()
  })

  it('assembleParameters true', async () => {
    let app = new Application({assembleParameters: true, formatResponse: false, autoRequire: false})
    app.app.use(async (ctx, next) => {
      ctx.body = {parameters: ctx.parameters}
    })
    let server = app.getHttpServer()
    await app.init()
    await request(server)
      .post(routerPrefix + '/user/hello/?name=deo')
      .send({message: 'hello'})
      .expect(200)
      .expect({parameters: {name: 'deo', message: 'hello'}})
    await app.close()
  })

  it('bodyParser false', async () => {
    let app = new Application({bodyParser: false, formatResponse: false, autoRequire: false})
    app.app.use(async (ctx, next) => {
      ctx.body = {requestBody: ctx.request.body}
    })
    let server = app.getHttpServer()
    await app.init()
    await request(server)
      .post(routerPrefix + '/user/hello?name=deo')
      .send({message: 'hello'})
      .expect(200)
      .expect({})
    await app.close()
  })

  it('bodyParser true', async () => {
    let app = new Application({bodyParser: true, formatResponse: false, autoRequire: false})
    app.app.use(async (ctx, next) => {
      ctx.body = {requestBody: ctx.request.body}
    })
    let server = app.getHttpServer()
    await app.init()
    await request(server)
      .post(routerPrefix + '/user/hello/?name=deo')
      .send({message: 'hello'})
      .expect(200)
      .expect({requestBody: {message: 'hello'}})
    await app.close()
  })
})
