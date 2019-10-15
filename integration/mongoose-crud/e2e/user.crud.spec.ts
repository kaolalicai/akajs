import * as request from 'supertest'
import {expect} from 'chai'
import {routerPrefix} from '@akajs/core'
import {app} from '../src/app'

describe('Mongoose crud', () => {
  let server

  const user1 = {
    '_id': '5b03b80c9b6c6043c138d1b6',
    'userId': '5b03b80c9b6c6043c138d1b6',
    'phone': '12399874456',
    'name': 'today'
  }
  const user2 = {
    'userId': '5b03b80c9b6c6043c138d156',
    'phone': '12399874456',
    'name': 'today'
  }

  before(async () => {
    server = app.getHttpServer()
    await app.init()
  })

  it(' create ', async () => {
    const res1 = await request(server).post(routerPrefix + `/user`)
      .send(user1)
      .expect(200)
    console.log('body', res1.body)
    expect(res1.body.code === 0)

    const res2 = await request(server).post(routerPrefix + `/user`)
      .send(user2)
      .expect(200)
    console.log('body', res2.body)
    expect(res2.body.code === 0)

  })

  it(' find ', async () => {
    const {body} = await request(server).get(routerPrefix + `/user/`)
      .expect(200)
    console.log('list', body)
    expect(body.data)
    expect(body.data).lengthOf(2)
  })

  it(' find with query', async () => {
    const {body} = await request(server).get(routerPrefix + `/user/`).query({userId: user1.userId})
      .expect(200)
    console.log('list', body)
    expect(body.data)
    expect(body.data).lengthOf(1)
    expect(body.data[0])
    expect(body.data[0].phone).eq(user1.phone)
  })

  it(' update ', async () => {
    const {body} = await request(server).put(routerPrefix + `/user/${user1._id}`).send({name: 'hhhh'})
      .expect(200)
    console.log('list', body)
    expect(body.data)
    expect(body.data.name).not.eq(user1.name)
  })

  it(' find one ', async () => {
    const {body} = await request(server).get(routerPrefix + `/user/${user1._id}`)
      .expect(200)
    console.log('list', body)
    expect(body.data)
    expect(body.data.phone).eq(user1.phone)
    expect(body.data.name).eq('hhhh')
  })

  after(async () => {
    await app.close()
  })
})
