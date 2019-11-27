import {logger} from './Logger'

describe('Logger.sepc', () => {

  it(' logger ', async () => {
    let obj = {
      a: 1
    }
    logger.info('object ', obj)
    logger.info(`object `, obj)
    logger.info(`object ${obj.toString()}`)
    logger.info('object %s', obj)
    // expect(parseSortString('ud desc')).deep.eq({ud: 0})
    // expect(parseSortString('ud DESC')).deep.eq({ud: 0})
    // expect(parseSortString('ud deSc')).deep.eq({ud: 0})
    // expect(parseSortString('ud deSC')).deep.eq({ud: 0})
    // expect(parseSortString('ud asc')).deep.eq({ud: 1})
    // expect(parseSortString('ud ASC')).deep.eq({ud: 1})
    //
    // expect(parseSortString('ud desc ')).deep.eq({ud: 0})
    // expect(parseSortString(' ud desc ')).deep.eq({ud: 0})
  })
})
