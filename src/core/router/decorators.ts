import {interfaces} from './interfaces'
import {decorate, injectable} from 'inversify'
import {METADATA_KEY} from './constants'

export function Controller (path: string, ...middleware: interfaces.Middleware[]) {
  return function (target: any) {

    let currentMetadata: interfaces.ControllerMetadata = {
      middleware: middleware,
      path: path,
      target: target
    }

    decorate(injectable(), target)
    Reflect.defineMetadata(METADATA_KEY.controller, currentMetadata, target)

    // We need to create an array that contains the metadata of all
    // the controllers in the application, the metadata cannot be
    // attached to a controller. It needs to be attached to a global
    // We attach metadata to the Reflect object itself to avoid
    // declaring additonal globals. Also, the Reflect is avaiable
    // in both node and web browsers.
    const previousMetadata: interfaces.ControllerMetadata[] = Reflect.getMetadata(
      METADATA_KEY.controller,
      Reflect
    ) || []

    const newMetadata = [currentMetadata, ...previousMetadata]

    Reflect.defineMetadata(
      METADATA_KEY.controller,
      newMetadata,
      Reflect
    )

  }
}

export function Get (path: string, ...middleware: interfaces.Middleware[]): interfaces.HandlerDecorator {
  return httpMethod('get', path, ...middleware)
}

export function Post (path: string, ...middleware: interfaces.Middleware[]): interfaces.HandlerDecorator {
  return httpMethod('post', path, ...middleware)
}

export function httpMethod (method: string, path: string, ...middleware: interfaces.Middleware[]): interfaces.HandlerDecorator {
  return function (target: any, key: string, value: any) {

    let metadata: interfaces.ControllerMethodMetadata = {
      key,
      method,
      middleware,
      path,
      target
    }
    addRouterMetadata(metadata)
  }
}

export function addRouterMetadata (metadata: interfaces.ControllerMethodMetadata) {

  let metadataList: interfaces.ControllerMethodMetadata[] = []

  if (!Reflect.hasMetadata(METADATA_KEY.controllerMethod, metadata.target.constructor)) {
    Reflect.defineMetadata(METADATA_KEY.controllerMethod, metadataList, metadata.target.constructor)
  } else {
    metadataList = Reflect.getMetadata(METADATA_KEY.controllerMethod, metadata.target.constructor)
  }

  metadataList.push(metadata)
}

export function DTO (dtoClass): Function {
  return function (target: any, methodName: string, index: number) {
    Reflect.defineMetadata(METADATA_KEY.controllerParameter + methodName, {index, dtoClass}, target.constructor)
  }
}
