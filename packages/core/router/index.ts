import {RouterBuilder} from './RouterBuilder'
import {Container} from 'inversify'

export function buildRouters (myContainer: Container, router) {
  let server = new RouterBuilder(myContainer, router)
  server.build()
}
