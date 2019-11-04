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
    existsKoa?: any
    router?: any
    formatResponse?: boolean
    bodyParser?: boolean
    assembleParameters?: boolean
  }
}
export {router, httpServe}
