import 'reflect-metadata'
import * as config from 'config'
import * as http from 'http'
import * as glob from 'glob'
import * as path from 'path'
import * as Koa from 'koa'
import * as bodyParser from 'koa-bodyparser'
import * as koaLogger from 'koa-logger'
import * as Router from 'koa-router'
import * as koaStatic from 'koa-static'
import {logger} from '@akajs/utils'
import {buildRouters, HealthCheckRouter} from './router'
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
    if (this._config.bodyParser !== false) this._app.use(bodyParser())
    this._app.use(koaLogger((str, args) => {
      if (str.includes('healthcheck')) return
      logger.info(str)
    }))
    // response format and  error handle
    if (this._config.formatResponse !== false) this._app.use(responseFormatter('^/api'))

    // 将所有参数注册到 ctx.parameters
    if (this._config.assembleParameters !== false) this._app.use(parameters)

    // statics
    this._app.use(koaStatic('assets'))
  }

  buildRouters () {
    this._router = this._config.router || new Router({prefix: routerPrefix})
    // routers
    buildRouters(container, this._router)
    this._app.use(HealthCheckRouter.routes())
    this._app.use(HealthCheckRouter.allowedMethods())
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
