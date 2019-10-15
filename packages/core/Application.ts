import 'reflect-metadata'
import {buildRouters} from './router'
import * as config from 'config'
import * as http from 'http'
import {logger} from '@akajs/utils'
import * as Koa from 'koa'
import * as bodyParser from 'koa-bodyparser'
import * as morgan from 'koa-morgan'
import * as Router from 'koa-router'
import * as koaStatic from 'koa-static'
import {responseFormatter} from './middleware/ResponseFormatter'
import {parameters} from './middleware/Parameters'
import {container} from './cantainer'
import {httpServe} from './interfaces/http'

export const routerPrefix = '/api/v1'

export class Application {
  private app
  private server

  constructor (config: httpServe.IKoaConfig) {
    this.createServe(config)
  }

  createServe (config: httpServe.IKoaConfig) {
    this.app = new Koa()
    // middleware
    this.app.use(bodyParser())
    this.app.use(morgan('tiny', {
      skip: function (req, res) {
        return /\/docs\//.exec(req.url) || /\/healthcheck\//.exec(req.url)
      }
    }))

    // response format and  error handle
    this.app.use(responseFormatter('^/api'))

    // 将所有参数注册到 ctx.parameters
    this.app.use(parameters)

    // statics
    this.app.use(koaStatic('assets'))

    // routers
    const router = new Router({prefix: routerPrefix})
    buildRouters(container, router)
    this.app.use(router.routes())
    this.app.use(router.allowedMethods())
    return this.app
  }

  getHttpServer () {
    this.server = http.createServer(this.app.callback())
    return this.server
  }

  async close () {
    this.server.close()
  }

  async init () {
    const port = config.get('port')
    this.getHttpServer()
    return new Promise((resolve, reject) => {
      this.server.listen(port, () => {
        logger.info(` app star in ${process.env.NODE_ENV || 'local'} env `)
        // logger.info(` app star in ${(Date.now() - time) / 1000} s, listen on port ${port}`)
        resolve()
      })
    })
  }
}
