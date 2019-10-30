import {Context} from 'koa'
import {cloneDeep} from 'lodash'

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

  if (parameters.page && !isNaN(parseInt(ctx.parameters.page))) Object.assign(parameters, {page: parseInt(ctx.parameters.page)})
  if (parameters.limit && !isNaN(parseInt(ctx.parameters.limit))) Object.assign(parameters, {limit: parseInt(ctx.parameters.limit)})
  ctx.parameters = parameters
  await next()
}
