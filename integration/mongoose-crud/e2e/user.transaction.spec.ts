import {request, prefix} from './TestHelper'
import {expect} from 'chai'

describe('user.transaction.spec', function () {
  this.timeout(5000)

  it(' transaction', async () => {
    const {body} = await request.post(prefix + `/user/transactionDemo`)
      .expect(200)
    expect(body.code).eq(0)
  })

  it(' rollback ', async () => {
    const {body} = await request.post(prefix + `/user/transactionRollbackDemo`)
      .expect(200)
    expect(body.code).eq(1)
  })

})
