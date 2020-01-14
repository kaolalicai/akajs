import 'reflect-metadata'
import * as config from 'config'
import * as http from 'http'
import * as glob from 'glob'
import * as path from 'path'
import * as Koa from 'koa'
import {Context} from 'koa'
import * as bodyParser from 'koa-bodyparser'
import * as Router from 'koa-router'
import * as morgan from 'koa-morgan'
import * as koaStatic from 'koa-static'
import {logger} from '@akajs/utils'
import {buildRouters, buildHealthCheck} from './router'
import {responseFormatter} from './middleware/ResponseFormatter'
import {parameters} from './middleware/Parameters'
import {requestLog} from './middleware/RequestLog'
import {container} from '@akajs/ioc'
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

  private _app: Context
  private _router
  private server
  private _config: httpServe.IKoaConfig

  constructor (config: httpServe.IKoaConfig) {
    this._config = config
    this.initKoa()
    if (this._config.autoBuild !== false) this.createServer()
  }

  initKoa () {
    this._app = this._config.existsKoa || new Koa()
  }

  buildPlugin () {
    // this._app = this._config.existsKoa || new Koa()
    if (this._config.bodyParser !== false) this.bodyParser()
    if (this._config.requestLog !== false) this.requestLog()
    if (this._config.assembleParameters !== false) this.assembleParameters()
    if (this._config.requestLogToDB === true) this.requestLogToDB()
    if (this._config.formatResponse !== false) this.formatResponse()
    if (this._config.statics === true) this.statics()
  }

  statics () {
    this._app.use(koaStatic('assets'))
  }

  bodyParser () {
    this._app.use(bodyParser())
  }

  formatResponse () {
    // response format and  error handle
    this._app.use(responseFormatter('^/api'))
  }

  requestLog () {
    // request log
    this._app.use(morgan(function (tokens, req, res) {
      if (tokens.url(req, res).includes('healthcheck')) return
      let str = [
        tokens.method(req, res),
        tokens.url(req, res),
        tokens.status(req, res),
        tokens.res(req, res, 'content-length'), '-',
        tokens['response-time'](req, res), 'ms'
      ].join(' ')
      logger.info(str)
    }))
  }

  requestLogToDB () {
    this._app.use(requestLog)
  }

  assembleParameters () {
    // 将所有参数注册到 ctx.parameters
    if (this._config.assembleParameters !== false) this._app.use(parameters)
  }

  buildMiddleware (middleware) {
    this._app.use(middleware)
  }

  buildRouters () {
    this._router = this._config.router || new Router({prefix: routerPrefix})
    // routers
    buildRouters(container, this._router)
    buildHealthCheck(this._router)
    this._app.use(this._router.routes())
    this._app.use(this._router.allowedMethods())
  }

  requireControllers () {
    let files = glob.sync(this._config.controllersPath || 'src/controller/*.*')
    for (let file of files) {
      let name = file.replace('.ts', '')
      logger.debug('scan controller file ', path.join(process.cwd(), name))
      // logger.debug('scan file ', name)
      require(path.resolve(path.join(process.cwd(), name)))
    }
  }

  createServer () {
    this.buildPlugin()
    // auto require
    if (this._config.autoRequire !== false) this.requireControllers()
    // routers
    this.buildRouters()
    return this._app
  }

  getHttpServer () {
    this.server = http.createServer(this._app.callback())
    return this.server
  }

  async close () {
    logger.debug('server close')
    this.server.close()
    logger.debug('container clear')
    container.unbindAll()
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
