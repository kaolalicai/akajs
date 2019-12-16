import {decorate, injectable} from 'inversify'
import {ModelMetadata, ITypeMongoOptions} from '../interfaces/mongoose'
import {METADATA_KEY} from '../constant'

/**
 * @deprecated
 * 请使用更好的 @TypeMongoModel
 * @param identify
 * @constructor
 */
export function MongoModel (identify: symbol | string) {
  return function (target: any) {
    decorate(injectable(), target)

    let currentMetadata: ModelMetadata = {
      identify: identify,
      target: target
    }

    Reflect.defineMetadata(METADATA_KEY.model, currentMetadata, target)

    const previousMetadata: ModelMetadata[] = Reflect.getMetadata(
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

export function TypeMongoModel (identify: symbol | string, options?: ITypeMongoOptions) {
  return function (target: any) {
    decorate(injectable(), target)

    let currentMetadata: ModelMetadata = {
      identify: identify,
      options: options,
      target: target
    }

    Reflect.defineMetadata(METADATA_KEY.model, currentMetadata, target)

    const previousMetadata: ModelMetadata[] = Reflect.getMetadata(
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
