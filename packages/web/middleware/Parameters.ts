import {Context} from 'koa'
import {cloneDeep, toNumber, isNaN} from 'lodash'

/**
 * 声明 ctx.parameters
 */
declare module 'koa' {
  interface Context {
    parameters: any
  }
}

/**
 * 将所有参数都汇总到一个变量中
 */
export async function parameters (ctx: Context, next) {
  const parameters = cloneDeep(ctx.request.body) || {}
  Object.assign(parameters, ctx.request.query)

  try {
    if (parameters.page && !isNaN(toNumber(parameters.page))) parameters.page = toNumber(parameters.page)
    if (parameters.limit && !isNaN(toNumber(parameters.limit))) parameters.limit = toNumber(parameters.limit)
  } catch (error) {
    throw new Error('参数转换错误：' + error.message)
  }
  ctx.parameters = parameters
  await next()
}
