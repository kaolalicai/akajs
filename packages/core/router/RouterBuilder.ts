import {logger} from '@akajs/utils'
import {Context} from 'koa'
import {assign, cloneDeep} from 'lodash'
import {validateOrReject} from 'class-validator'
import * as inversify from 'inversify'
import {
  getControllerMetadata,
  getControllerMethodMetadata,
  getControllersFromContainer,
  getControllersFromMetadata,
  getDtoMetadata
} from '../utils/MetaData'
import {DUPLICATED_CONTROLLER_NAME, TYPE} from '../constants'
import {router} from '../interfaces/router'

export type RouterMiddleware = (ctx: Context, next: Function) => Promise<any>
export type RouterHandle = (ctx: Context) => Promise<any>

let routerInit: boolean = false

export class RouterBuilder {
  private readonly _router: any
  private readonly _container: inversify.interfaces.Container
  private _forceControllers: boolean
  private _routingConfig: router.RoutingConfig

  constructor (container: inversify.interfaces.Container,
               router: any,
               routingConfig?: router.RoutingConfig | null) {
    this._container = container
    this._router = router
    this._routingConfig = routingConfig
  }

  build () {
    if (routerInit) return
    // 把 Controller 在容器里绑定
    let constructors = getControllersFromMetadata()

    constructors.forEach((constructor) => {
      const name = constructor.name

      if (this._container.isBoundNamed(TYPE.Controller, name)) {
        throw new Error(DUPLICATED_CONTROLLER_NAME(name))
      }

      this._container.bind(TYPE.Controller)
        .to(constructor)
        .whenTargetNamed(name)
    })

    // 从容器里取出所有 Controller，然后注册路由
    let controllers = getControllersFromContainer(
      this._container,
      this._forceControllers
    )

    controllers.forEach((controller: router.Controller) => {

      let controllerMetadata = getControllerMetadata(controller.constructor)
      let methodMetadata = getControllerMethodMetadata(controller.constructor)
      // let parameterMetadata = getControllerParameterMetadata(controller.constructor)
      if (controllerMetadata && methodMetadata) {

        let controllerMiddleware = this.resolveMiddleware(...controllerMetadata.middleware)

        methodMetadata.forEach((metadata: router.ControllerMethodMetadata) => {
          // let paramList: router.ParameterMetadata[] = []
          // if (parameterMetadata) {
          //   paramList = parameterMetadata[metadata.key] || []
          // }
          let methodName = metadata.key
          let handler: RouterHandle = this.handlerFactory(controller, methodName)
          let routeMiddleware: RouterMiddleware[] = this.resolveMiddleware(...metadata.middleware)
          logger.debug('register router', metadata.method, controllerMetadata.target.name, controllerMetadata.path, metadata.path)
          this._router[metadata.method](
            `${controllerMetadata.path}${metadata.path}`,
            ...controllerMiddleware,
            ...routeMiddleware,
            handler
          )
        })
      }
    })

    routerInit = true
  }

  private handlerFactory (
    controller: router.Controller,
    methodName: string
    // parameterMetadata: router.ParameterMetadata[]
  ): RouterHandle {
    let dtoMetadata = getDtoMetadata(controller.constructor, methodName)
    let _this = this
    return async function (ctx: Context) {
      try {
        let args = await _this.modifyDTOParameters(ctx, dtoMetadata)
        // invoke controller's action
        // console.log('controller[methodName]', controller[methodName], methodName)
        await controller[methodName](...args)
        // ctx.body = value
      } catch (err) {
        throw err
      }
    }
  }

  private async modifyDTOParameters (ctx: Context, dtoMetadata: router.ControllerMethodParameterMetadata): Promise<any[]> {
    const parameters = this.extractParameters(ctx)
    const args = []
    args[0] = ctx
    args[1] = parameters
    if (dtoMetadata && dtoMetadata.index !== undefined && dtoMetadata.index !== null) {
      const dto = new dtoMetadata.dtoClass()
      assign(dto, parameters)
      await validateOrReject(dto)
      args[dtoMetadata.index] = dto
    }
    return args
  }

  private extractParameters (ctx: Context): any[] {
    const parameters = cloneDeep(ctx.request.body) || {}
    Object.assign(parameters, ctx.request.query)
    return parameters
  }

  private resolveMiddleware (...middleware: router.Middleware[]): RouterMiddleware[] {
    return middleware.map(middlewareItem => {
      if (!this._container.isBound(middlewareItem)) {
        return middlewareItem as RouterMiddleware
      }
      const m = this._container.get<RouterMiddleware>(middlewareItem)
      // if (m instanceof BaseMiddleware) {
      //   const _self = this
      //   return async function (
      //     req: koa.Request,
      //     res: koa.Response,
      //     next: Function
      //   ) {
      //     let mReq = _self._container.get<BaseMiddleware>(middlewareItem);
      //     (mReq as any).httpContext = _self._getHttpContext(req)
      //     mReq.handler(req, res, next)
      //   }
      // }
      return m
    })
  }

}
