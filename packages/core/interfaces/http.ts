import {interfaces as inversifyInterfaces} from 'inversify'

namespace router {
  export type Middleware = (inversifyInterfaces.ServiceIdentifier<any>)

  export interface ControllerMetadata {
    path: string
    middleware: Middleware[]
    target: any
  }

  export interface ControllerMethodMetadata extends ControllerMetadata {
    method: string
    key: string
  }

  export interface ControllerMethodParameterMetadata {
    dtoClass: any
    index: string
  }

  export interface Controller {
  }

  export interface HandlerDecorator {
    (target: any, key: string, value: any): void
  }

  export interface RoutingConfig {
    rootPath: string
  }
}

namespace httpServe {
  export interface IKoaConfig {
    autoBuild?: boolean
    autoRequire?: boolean
    controllersPath?: string
    existsKoa?: any
    router?: any

    // 通用的中间件
    formatResponse?: boolean
    bodyParser?: boolean
    assembleParameters?: boolean
    // 请求日志输出到文件系统
    requestLog?: boolean
    // 请求日志输出到mongodb，只保存 post 请求
    requestLogToDB?: boolean
    statics?: boolean
  }
}
export {router, httpServe}
