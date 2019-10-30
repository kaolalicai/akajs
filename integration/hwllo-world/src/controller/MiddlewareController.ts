import {isObject} from 'lodash'
import {Controller, Get} from '@akajs/core'
import {logger} from '@akajs/utils'

const routerMiddleware = async function (ctx, next) {
  await next()
  if (isObject(ctx.body)) {
    ctx.body.info = 'inject from router middleware'
  }
}

@Controller(
  '/mid',
  async (ctx, next) => {
    logger.info('Hello from controller middleware!')
    ctx.set('Kalengo', 'inject form middleware')
    await next()
    // ctx.body.info = 'inject form middleware'
  })
export class MiddlewareController {

  @Get('/get', routerMiddleware)
  async get (ctx) {
    ctx.body = {name: 'hello'}
  }
}
