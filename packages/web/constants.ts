export const TYPE = {
  AuthProvider: Symbol.for('AuthProvider'),
  Controller: Symbol.for('Controller'),
  HttpContext: Symbol.for('HttpContext')
}

export const METADATA_KEY = {
  controller: 'inversify-koa-utils:controller',
  controllerMethod: 'inversify-koa-utils:controller-method',
  controllerParameter: 'inversify-koa-utils:controller-parameter',
  httpContext: 'inversify-koa-utils:httpcontext'
}

export const DUPLICATED_CONTROLLER_NAME = (name: string) =>
  `Two controllers cannot have the same name: ${ name }`

export const NO_CONTROLLERS_FOUND = 'No controllers have been found! ' +
  'Please ensure that you have register at least one Controller.'
