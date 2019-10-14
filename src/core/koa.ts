import {buildRouters} from './router'
import * as bodyParser from 'koa-bodyparser'
import * as morgan from 'koa-morgan'
import * as serve from 'koa-static'
import * as Router from 'koa-router'
import {responseFormatter} from './middleware/ResponseFormatter'
import {parameters} from './middleware/Parameters'
import {container} from '../cantainer'

export interface IKoaConfig {
  formatResponse?: boolean
  bodyParser?: boolean
}

export function buildKoaServe (app, config: IKoaConfig) {
  // middleware
  app.use(bodyParser())
  app.use(morgan('tiny', {
    skip: function (req, res) {
      return /\/docs\//.exec(req.url) || /\/healthcheck\//.exec(req.url)
    }
  }))

  // response format and  error handle
  app.use(responseFormatter('^/api'))

  // 将所有参数注册到 ctx.parameters
  app.use(parameters)

  // statics
  app.use(serve('assets'))

  // routers
  const router = new Router({prefix: '/api/v1'})
  buildRouters(container, router)
  app.use(router.routes())
  app.use(router.allowedMethods())
}
