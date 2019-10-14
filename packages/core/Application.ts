import 'reflect-metadata'
import {buildRouters} from './router'
import * as Koa from 'koa'
import * as bodyParser from 'koa-bodyparser'
import * as morgan from 'koa-morgan'
import * as Router from 'koa-router'
import * as koaStatic from 'koa-static'
import {responseFormatter} from './middleware/ResponseFormatter'
import {parameters} from './middleware/Parameters'
import {container} from './cantainer'
import {httpServe} from './interfaces/http'

export class Application {
  createServe (config: httpServe.IKoaConfig) {
    const serve = new Koa()
    // middleware
    serve.use(bodyParser())
    serve.use(morgan('tiny', {
      skip: function (req, res) {
        return /\/docs\//.exec(req.url) || /\/healthcheck\//.exec(req.url)
      }
    }))

    // response format and  error handle
    serve.use(responseFormatter('^/api'))

    // 将所有参数注册到 ctx.parameters
    serve.use(parameters)

    // statics
    serve.use(koaStatic('assets'))

    // routers
    const router = new Router({prefix: '/api/v1'})
    buildRouters(container, router)
    serve.use(router.routes())
    serve.use(router.allowedMethods())
    return serve
  }
}
