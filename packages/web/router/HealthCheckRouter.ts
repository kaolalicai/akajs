import * as Router from 'koa-router'

export const HealthCheckRouter = new Router()

let isOk = true

export function buildHealthCheck (router) {
  router.get('/healthcheck/check', async (ctx, next) => {
    if (isOk) {
      ctx.body = 'everything is ok'
      return
    } else {
      ctx.body = 'server status unable'
      ctx.response.status = 503
      return
    }
  })

  router.get('/healthcheck/status/reset', async (ctx, next) => {
    isOk = (ctx.query.status === 'true')
    return ctx.body = 'reset status ok'
  })
}
