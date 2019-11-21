import {expect} from 'chai'
import {request, prefix} from './TestHelper'

describe('account.spec', () => {

  const user = {
    '_id': '5b03b80c9b6c6043c138d1b6',
    'userId': '5b03b80c9b6c6043c138d1b6',
    'phone': '12399874488',
    'name': 'today'
  }

  it(' create ', async () => {
    const res1 = await request.post(prefix + `/user`)
      .send(user)
      .expect(200)
    console.log('body', res1.body)
    expect(res1.body.code === 0)
  })

  it('跨模块访问 findOne ', async () => {
    const res1 = await request.get(prefix + `/account/findUser`).query({name: user.name})
      .expect(200)
    console.log('body', res1.body)
    expect(res1.body.code === 0)
    expect(res1.body.data)
    expect(res1.body.data.name).eq(user.name)
    expect(res1.body.data.phone).eq(user.phone)
  })

})
