import * as _ from 'lodash'

export function parseApiToQuery (parameters) {
  let pageKeys = ['where', 'limit', 'page', 'sort', 'select', 'omit']
  const filters = _.pick(parameters, ...pageKeys)
  const query = _.omit(parameters, ...pageKeys)
  let {page, limit} = filters
  page = _.toNumber(page) || 0
  limit = _.toNumber(limit) || 30
  let skip: number = page * limit
  let sorter: object = parseSortString(filters.sort)
  let selectors: object = parseSelectString(filters.select, filters.omit)
  let where: object = parserWhereString(filters.where)
  Object.assign(query, where)
  return {
    query,
    skip,
    limit,
    sorter,
    selectors
  }
}

export function parserWhereString (str?: string): object {
  try {
    if (!str) return {}
    if (str.trim() === '') return {}
    return JSON.parse(str)
  } catch (err) {
    throw new Error('where 只支持 json 格式: where={"age": {$gt :0}, 也就是 mongoose 支持的查询条件: ' + err.message)
  }
}

export function parseSelectString (select?: string, omit?: string): object {
  let selectors = {}
  if (select) {
    Object.assign(selectors, select.trim().split(',').reduce((obj, key) => {
      obj[key.trim()] = 1
      return obj
    }, {}))
  }
  if (omit) {
    Object.assign(selectors, omit.trim().split(',').reduce((obj, key) => {
      obj[key.trim()] = 0
      return obj
    }, {}))
  }
  return selectors
}

export function parseSortString (str: string): object {
  str = _.trimEnd(str)
  str = _.trimStart(str)
  if (str === '') return {}
  let strs = str.split(' ')
  if (strs.length !== 2) throw new Error('sort 的正确格式是 ?sort=lastName ASC/DESC')
  let desc = strs[1].toLowerCase()
  if (!['desc', 'asc'].includes(desc)) throw new Error('sort 的正确格式是 ?sort=lastName ASC/DESC')
  let map = {
    'desc': -1,
    'asc': 1
  }
  let sorter = {}
  sorter[strs[0]] = map[desc]
  return sorter
}
