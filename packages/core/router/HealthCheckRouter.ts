import * as Router from 'koa-router'

export const HealthCheckRouter = new Router()

let isOk = true

HealthCheckRouter.get('/healthcheck/check',async (ctx,next) => {
  if (isOk === true) {
    ctx.body = 'everything is ok'
    return
  } else {
    ctx.body = 'server status unable'
    ctx.response.status = 503
    return
  }
})

HealthCheckRouter.get('/healthcheck/status/reset',async (ctx,next) => {
  isOk = (ctx.query.status === 'true')
  return ctx.body = 'reset status ok'
})
