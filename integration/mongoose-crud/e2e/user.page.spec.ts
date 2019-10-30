import {expect} from 'chai'
import {request, prefix} from './TestHelper'

describe('user.page.spec 分页测试', () => {
  const user = {
    'userId': '5b03b80c9b6c6043c138d1b6',
    'phone': '12399874488',
    'name': 'today'
  }

  const totalCount = 40

  it(' create ', async () => {
    const userIds = new Array(totalCount).fill(0).map((value, index) => index)
    for (let ud of userIds) {
      user.userId = '5b03b80c9b6c6043c138d1b6' + ud
      const res1 = await request.post(prefix + `/user`)
        .send(user)
        .expect(200)
      console.log('body', res1.body)
      expect(res1.body.code === 0)
    }
  })

  it(' default 不分页，结果放 data，limit 30个', async () => {
    const {body} = await request.get(prefix + `/user/`)
      .expect(200)
    console.log('list', body)
    expect(body.data)
    expect(body.data).lengthOf(30)
  })

  it(' page 1 分页后 结果放 list，还有 totalCount', async () => {
    const {body} = await request.get(prefix + `/user/`).query({page: 1})
      .expect(200)
    console.log('list', body)
    expect(body.data.list)
    // 默认每页 30
    expect(body.data.list).lengthOf(10)
    expect(body.data.totalCount).eq(totalCount)
  })

  it(' 使用其他查询参数 ', async () => {
    // name 不会被用于查询过滤
    const res1 = await request.get(prefix + `/user/`).query({page: 1, name: 'today33'})
      .expect(200)
    console.log('res1', res1.body)
    expect(res1.body.data.list).lengthOf(0)
  })

})
