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
  ctx.parameters = parameters
  await next()
}
