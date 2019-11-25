import {interfaces as inversifyInterfaces} from 'inversify'
import {TYPE, NO_MODELS_FOUND, METADATA_KEY} from '../constant'
import {IBaseMongoModel, ModelMetadata} from '../interfaces/mongoose'

export function getModelsFromMetadata () {
  let modelMetadata: ModelMetadata[] = Reflect.getMetadata(
    METADATA_KEY.model,
    Reflect
  ) || []
  return modelMetadata.map((metadata) => metadata.target)
}

export function getModelMetadata (constructor: any) {
  let modelMetadata: ModelMetadata = Reflect.getMetadata(
    METADATA_KEY.model,
    constructor
  )
  return modelMetadata
}

export function getModelsFromContainer (
  container: inversifyInterfaces.Container,
  force: boolean
) {
  if (container.isBound(TYPE.Model)) {
    return container.getAll(TYPE.Model)
  } else if (force) {
    throw new Error(NO_MODELS_FOUND)
  } else {
    return []
  }
}
