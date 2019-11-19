import {expect} from 'chai'
import {request, prefix} from './TestHelper'

describe('Mongoose crud', () => {
  const user1 = {
    '_id': '5b03b80c9b6c6043c138d1b6',
    'userId': '5b03b80c9b6c6043c138d1b6',
    'phone': '12399874488',
    'name': 'today'
  }
  const user2 = {
    'userId': '5b03b80c9b6c6043c138d156',
    'phone': '12399874456',
    'name': 'today'
  }

  it(' create ', async () => {
    const res1 = await request.post(prefix + `/user`)
      .send(user1)
      .expect(200)
    console.log('body', res1.body)
    expect(res1.body.code === 0)

    const res2 = await request.post(prefix + `/user`)
      .send(user2)
      .expect(200)
    console.log('body', res2.body)
    expect(res2.body.code === 0)

  })

  it(' find ', async () => {
    const {body} = await request.get(prefix + `/user/`)
      .expect(200)
    console.log('list', body)
    expect(body.data)
    expect(body.data).lengthOf(2)
  })

  it(' find with query', async () => {
    const {body} = await request.get(prefix + `/user/`).query({phone: user1.phone})
      .expect(200)
    console.log('list', body)
    expect(body.data)
    expect(body.data).lengthOf(1)
    expect(body.data[0])
    expect(body.data[0].name).eq(user1.name)
  })

  it(' update ', async () => {
    let name = 'hognda'
    const {body} = await request.put(prefix + `/user/${user1._id}`).send({name: name})
      .expect(200)
    console.log('list', body)
    expect(body.data)
    expect(body.data.name).not.eq(user1.name)

    const res2 = await request.get(prefix + `/user/${user1._id}`)
      .expect(200)
    console.log('list', res2.body)
    expect(res2.body.data)
    expect(res2.body.data.phone).eq(user1.phone)
    expect(res2.body.data.name).eq(name)
  })

  it(' remove ', async () => {
    const {body} = await request.delete(prefix + `/user/${user1._id}`)
      .expect(200)
    console.log('remove', body)
    expect(body.message)
    expect(body.message).eq('success')

    const res2 = await request.get(prefix + `/user/${user1._id}`)
      .expect(200)
    console.log('find', res2.body)
    expect(res2.body.data)
    expect(res2.body.message).match(/找不到/)
  })

})
