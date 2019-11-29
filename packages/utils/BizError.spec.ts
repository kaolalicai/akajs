import {expect} from 'chai'
import {BizError} from './BizError'
import {logger} from './Logger'

describe('BizError.spec', () => {

  it(' message only', async () => {
    const error1 = new BizError('msg')
    expect(error1.code).eq(1)
    expect(error1.message).eq('msg')

    const error2 = new BizError(-1, '')
    expect(error2.code).eq(-1)
    expect(error2.message).eq('')
  })

  it(' code + message ', async () => {
    const error1 = new BizError(12, 'msg')
    expect(error1.code).eq(12)
    expect(error1.message).eq('msg')

    const error2 = new BizError(-1, '')
    expect(error2.code).eq(-1)
    expect(error2.message).eq('')
  })

  it(' code + message + value', async () => {
    const error1 = new BizError(12, 'msg %s', 12)
    expect(error1.code).eq(12)
    expect(error1.message).eq('msg 12')

    const error2 = new BizError(-1, 'msg %s', 'key')
    expect(error2.code).eq(-1)
    expect(error2.message).eq('msg key')
  })

  it('message + value', async () => {
    const error1 = new BizError('msg %s', 12)
    expect(error1.code).eq(1)
    expect(error1.message).eq('msg 12')

    const error2 = new BizError('msg %s', 'key')
    expect(error2.code).eq(1)
    expect(error2.message).eq('msg key')
  })

  it(' toString ', async () => {
    logger.info(' normal ')
    logger.info('error msg is ', new BizError('msg %s', 12))
    expect(new BizError('msg %s', 12)).eq(1)
  })
})
