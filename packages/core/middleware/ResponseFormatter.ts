import * as _ from 'lodash'
import {ValidationError} from 'class-validator'
import {BizError, logger} from '@akajs/utils'

export function responseFormatter (pattern) {
  return async (ctx, next) => {
    const reg = new RegExp(pattern)
    // 符合相应规则才格式化返回 例如: ^/api
    if (!reg.test(ctx.originalUrl)) return await next()

    try {
      await next()
      return responseFormatter(ctx)
    } catch (error) {
      if (error instanceof BizError) {
        logger.info('业务逻辑错误 ', error)
        ctx.status = 200
        ctx.body = {
          code: error.code,
          message: error.message
        }
        return
      } else if (error.isJoi) {
        logger.info('参数校验错误 ', error)
        const msg = error.details.map(item => item.message).join(',')
        ctx.status = 200
        ctx.body = {
          code: -1,
          message: msg
        }
        return
      } else if (_.isArray(error) && error[0] instanceof ValidationError) {
        logger.info('参数校验错误 ', error)
        const key = Object.keys(error[0].constraints)[0]
        const msg = error[0].constraints[key]
        ctx.body = {
          code: 1,
          message: msg
        }
        return
      } else {
        logger.error('系统内部错误 ', error.stack)
        ctx.status = 200
        ctx.body = {
          code: 1,
          message: error.message
        }
        return
      }
    }

    function responseFormatter (ctx) {
      if (ctx.type === 'text/html') return
      if (ctx.type === 'text/html') return
      const body = ctx.body
      ctx.status = ctx.status || 200
      if (ctx.status === 204) ctx.status = 200
      if (_.isString(body)) {
        ctx.body = {
          code: 0,
          message: body
        }
      } else {
        ctx.body = {
          code: 0,
          message: 'success',
          data: body
        }
      }
    }
  }
}
