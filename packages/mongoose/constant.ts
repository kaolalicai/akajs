export const NO_MODELS_FOUND = 'No models have been found! ' +
  'Please ensure that you have register at least one Model.'

export const DUPLICATED_CONTROLLER_NAME = (name: string) =>
  `Two model cannot have the same name: ${name}`

export const TYPE = {
  DEFAULT_CONNECTION: Symbol.for('MONGO_DEFAULT_CONNECTION'),
  Model: Symbol.for('Model')
}

export const METADATA_KEY = {
  model: 'inversify-mongoose-utils:model'
}
