import {decorate, injectable} from 'inversify'
import {router} from '@akajs/core'
import {ModelMetadata} from '../interfaces/mongoose'
import {METADATA_KEY} from '../constant'

export function MongoModel (identify: symbol | string) {
  return function (target: any) {
    decorate(injectable(), target)

    let currentMetadata: ModelMetadata = {
      identify: identify,
      target: target
    }

    Reflect.defineMetadata(METADATA_KEY.model, currentMetadata, target)

    const previousMetadata: router.ControllerMetadata[] = Reflect.getMetadata(
      METADATA_KEY.model,
      Reflect
    ) || []

    const newMetadata = [currentMetadata, ...previousMetadata]

    Reflect.defineMetadata(
      METADATA_KEY.model,
      newMetadata,
      Reflect
    )
  }
}
