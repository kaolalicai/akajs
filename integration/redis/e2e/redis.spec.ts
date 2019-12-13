import * as request from 'supertest'
import {routerPrefix} from '@akajs/core'
import {flushdb} from '@akajs/redis'
import {app} from '../src/app'
import * as Bluebird from 'bluebird'
import {expect} from 'chai'
import * as _ from 'lodash'

describe('redis', () => {
  let server
  before(async () => {
    await app.init()
    await flushdb()
    server = app.getHttpServer()
  })

  it(`should return value`, () => {
    return request(server)
            .post(routerPrefix + '/redis/set')
            .send({key: 'testKey',value: 'testValue'})
            .expect(200)
            .expect({ code: 0, message: 'testValue' })
  })

  it('mutex',async () => {
    const result = await Bluebird.all([
      request(server).post(routerPrefix + '/redis/mutex'),
      request(server).post(routerPrefix + '/redis/mutex')
    ])
    const successCount = _.filter(result,item => item.body.code === 0)
    result.map(item => {
      expect(successCount).lengthOf(1)
    })
  })

  it('clear db',() => {
    return flushdb()
  })
})
