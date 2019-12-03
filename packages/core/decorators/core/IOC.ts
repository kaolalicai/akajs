import {decorate, injectable, interfaces as inversifyInterfaces, inject} from 'inversify'
import {container} from '../../cantainer'
import getDecorators from 'inversify-inject-decorators'

const {lazyInject} = getDecorators(container, false)
export {inject as Inject, injectable as Injectable} from 'inversify'
export {lazyInject as LazyInject}

export function Service (
  serviceIdentifier?: inversifyInterfaces.ServiceIdentifier<any>
) {
  return function (target: any) {
    // decorate(provide(serviceIdentifier, true), target)
    decorate(injectable(), target)
    if (serviceIdentifier === undefined) {
      if (target.name) {
        console.log('auto bind service ', target.name)
        serviceIdentifier = target.name
      }
    }
    container.bind(serviceIdentifier).to(target).inSingletonScope()
    if (typeof (serviceIdentifier) === 'string') {
      container.bind(fixIdentifier(serviceIdentifier)).to(target).inSingletonScope()
    }
    return target
  }
}

export function fixIdentifier (key) {
  return key.toLowerCase().replace('_', '')
}

/**
 * 自动注入
 * @constructor
 */
export function Autowired () {
  return function (target: any, targetKey: string, index?: number) {
    let serviceIdentifier: inversifyInterfaces.ServiceIdentifier<any> = null
    // Property
    if (targetKey) {
      let key = fixIdentifier(targetKey)
      if (key && container.isBound(key)) {
        serviceIdentifier = key
      }
    }
    if (typeof index === 'number') {
      throw new Error('Autowired fail 不支持注入到参数中 ')
    }
    if (serviceIdentifier === null) {
      throw new Error('Autowired fail 找不到能够注入的对象 ')
    }
    return inject(serviceIdentifier)(target, targetKey, index)
  }
}
