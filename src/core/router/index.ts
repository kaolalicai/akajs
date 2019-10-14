import {InversifyKoaServer} from './services'
import {Container} from 'inversify'

export function buildRouters (myContainer: Container, router) {
  let server = new InversifyKoaServer(myContainer, router)
  server.build()
}

export {Get, Post, DTO, Controller} from './decorators'
