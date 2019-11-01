import * as request from 'supertest'
import {routerPrefix,Application} from '@akajs/core'
import {AppError} from '@akajs/utils'
import {expect} from 'chai'

describe('config.spec 配置测试', () => {
  it('formatResponse false return ctx.body',async () => {
    let app = new Application({formatResponse: false})
    app.app.use(async (ctx,next) => {
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

  it('formatResponse true return to ctx.body.data',async () => {
    let app = new Application({formatResponse: true})
    app.app.use(async (ctx,next) => {
      ctx.body = 'success'
    })
    let server = app.getHttpServer()
    await app.init()
    await request(server)
        .get(routerPrefix + '/user/hello/nick')
        .expect(200)
        .expect({code: 0,'message': 'success'})
    await app.close()
  })
})
