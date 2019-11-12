import {expect} from 'chai'
import {parseSortString, parseSelectString, parseApiToQuery} from './resetApiUtil'

describe('resetApiUtil test', () => {

  it(' parseSortString 不区分大小写 ', async () => {
    expect(parseSortString('ud desc')).deep.eq({ud: 0})
    expect(parseSortString('ud DESC')).deep.eq({ud: 0})
    expect(parseSortString('ud deSc')).deep.eq({ud: 0})
    expect(parseSortString('ud deSC')).deep.eq({ud: 0})
    expect(parseSortString('ud asc')).deep.eq({ud: 1})
    expect(parseSortString('ud ASC')).deep.eq({ud: 1})

    expect(parseSortString('ud desc ')).deep.eq({ud: 0})
    expect(parseSortString(' ud desc ')).deep.eq({ud: 0})
  })

  it(' parseSortString 错误格式报错 ', async () => {
    expect(() => {
      parseSortString('ud DESC asdf')
    }).to.throw(Error)
    expect(() => {
      parseSortString('ud deSc,dfd')
    }).to.throw(Error)
  })

  it(' parseSelectString', async () => {
    expect(parseSelectString('name,age', 'phone')).deep.eq({name: 1, age: 1, phone: 0})
    expect(parseSelectString('name,age ', 'phone')).deep.eq({name: 1, age: 1, phone: 0})
    expect(parseSelectString('name , age ', 'phone')).deep.eq({name: 1, age: 1, phone: 0})
    expect(parseSelectString('name , age ', 'age')).deep.eq({name: 1, age: 0})
  })

  it(' parseApiToQuery full', async () => {
    expect(parseApiToQuery({
      page: 1, limit: 20, mail: 'today33',
      where: '{"name" : {"$eq" : "hello"}}',
      select: 'name,age',
      omit: 'phone'
    })).deep.eq({
      'limit': 20,
      'query': {
        'mail': 'today33',
        'name': {
          '$eq': 'hello'
        }
      },
      'selectors': {
        'age': 1,
        'name': 1,
        'phone': 0
      },
      'skip': 20,
      'sorter': {}
    })
  })

  it(' parseApiToQuery sort', async () => {
    expect(parseApiToQuery({sort: 'count DESC'})).deep.eq({
      'limit': 30,
      'query': {},
      'selectors': {},
      'skip': 0,
      'sorter': {
        'count': 0
      }
    })

    expect(parseApiToQuery({sort: 'count ASC'})).deep.eq({
      'limit': 30,
      'query': {},
      'selectors': {},
      'skip': 0,
      'sorter': {
        'count': 1
      }
    })
  })

  it(' parseApiToQuery empty', async () => {
    expect(parseApiToQuery({})).deep.eq({
      'limit': 30,
      'query': {},
      'selectors': {},
      'skip': 0,
      'sorter': {}
    })
  })

  it(' parseApiToQuery page limit must be numeric', async () => {
    expect(parseApiToQuery({limit: '30', page: '1'})).deep.eq({
      'limit': 30,
      'query': {},
      'selectors': {},
      'skip': 30,
      'sorter': {}
    })
  })
})
