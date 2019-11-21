import {decorate, injectable, interfaces as inversifyInterfaces} from 'inversify'
import {container} from '../../cantainer'
import getDecorators from 'inversify-inject-decorators'

const {lazyInject} = getDecorators(container, false)
export {inject as Inject, injectable as Injectable} from 'inversify'
export {lazyInject as LazyInject}

export function Service (
  serviceIdentifier: inversifyInterfaces.ServiceIdentifier<any>
) {

  return function (target: any) {
    // decorate(provide(serviceIdentifier, true), target)
    decorate(injectable(), target)
    container.bind(serviceIdentifier).to(target)
    return target

  }
}
