import {decorate, injectable, interfaces as inversifyInterfaces} from 'inversify'
import {container} from '../../cantainer'

export {inject as Inject, injectable as Injectable} from 'inversify'

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
