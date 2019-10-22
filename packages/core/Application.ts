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
  get router () {
    return this._router
  }

  set router (value) {
    this._router = value
  }

  get app () {
    return this._app
  }

  set app (value) {
    this._app = value
  }

  private _app
  private _router
  private server
  private _config: httpServe.IKoaConfig

  constructor (config: httpServe.IKoaConfig) {
    this._config = config
    this.createServer()
  }

  buildPlugin () {
    this._app = this._config.existsKoa || new Koa()
    // middleware
    this._app.use(bodyParser())
    this._app.use(morgan('tiny', {
      skip: function (req, res) {
        return /\/docs\//.exec(req.url) || /\/healthcheck\//.exec(req.url)
      }
    }))

    // response format and  error handle
    this._app.use(responseFormatter('^/api'))

    // 将所有参数注册到 ctx.parameters
    this._app.use(parameters)

    // statics
    this._app.use(koaStatic('assets'))
  }

  buildRouters () {
    this._router = this._config.router || new Router({prefix: routerPrefix})
    // routers
    buildRouters(container, this._router)
    this._app.use(this._router.routes())
    this._app.use(this._router.allowedMethods())
  }

  createServer () {
    this.buildPlugin()
    // routers
    this.buildRouters()
    return this._app
  }

  getHttpServer () {
    this.server = http.createServer(this._app.callback())
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
