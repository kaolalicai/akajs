import {Context} from 'koa'
import {assign, cloneDeep} from 'lodash'
import {validateOrReject} from 'class-validator'
import * as inversify from 'inversify'
import {interfaces} from './interfaces'
import {
  getControllerMetadata,
  getControllerMethodMetadata,
  getControllersFromContainer,
  getControllersFromMetadata,
  getDtoMetadata
} from './utils'
import {DUPLICATED_CONTROLLER_NAME, TYPE} from './constants'

export type RouterMiddleware = (ctx: Context, next: Function) => Promise<any>
export type RouterHandle = (ctx: Context) => Promise<any>

export class InversifyKoaServer {
  private readonly _router: any
  private readonly _container: inversify.interfaces.Container
  private _forceControllers: boolean
  private _routingConfig: interfaces.RoutingConfig

  constructor (container: inversify.interfaces.Container,
               router: any,
               routingConfig?: interfaces.RoutingConfig | null) {
    this._container = container
    this._router = router
    this._routingConfig = routingConfig
  }

  build () {
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

    controllers.forEach((controller: interfaces.Controller) => {

      let controllerMetadata = getControllerMetadata(controller.constructor)
      let methodMetadata = getControllerMethodMetadata(controller.constructor)
      // let parameterMetadata = getControllerParameterMetadata(controller.constructor)
      if (controllerMetadata && methodMetadata) {

        let controllerMiddleware = this.resolveMiddleware(...controllerMetadata.middleware)

        methodMetadata.forEach((metadata: interfaces.ControllerMethodMetadata) => {
          // let paramList: interfaces.ParameterMetadata[] = []
          // if (parameterMetadata) {
          //   paramList = parameterMetadata[metadata.key] || []
          // }
          let methodName = metadata.key
          let handler: RouterHandle = this.handlerFactory(controller, methodName)
          let routeMiddleware: RouterMiddleware[] = this.resolveMiddleware(...metadata.middleware)
          console.log('register router', metadata.method, controllerMetadata.target.name, controllerMetadata.path, metadata.path)
          this._router[metadata.method](
            `${controllerMetadata.path}${metadata.path}`,
            ...controllerMiddleware,
            ...routeMiddleware,
            handler
          )
        })
      }
    })
  }

  private handlerFactory (
    controller: interfaces.Controller,
    methodName: string
    // parameterMetadata: interfaces.ParameterMetadata[]
  ): RouterHandle {
    let dtoMetadata = getDtoMetadata(controller.constructor, methodName)
    return async (ctx: Context) => {
      try {
        let args = await this.modifyDTOParameters(ctx, arguments, dtoMetadata)
        // invoke controller's action
        // console.log('controller[methodName]', controller[methodName], methodName)
        await controller[methodName](...args)
        // ctx.body = value
      } catch (err) {
        throw err
      }
    }
  }

  private async modifyDTOParameters (ctx: Context, args, dtoMetadata: interfaces.ControllerMethodParameterMetadata): Promise<any[]> {
    const parameters = this.extractParameters(ctx)
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

  private resolveMiddleware (...middleware: interfaces.Middleware[]): RouterMiddleware[] {
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
