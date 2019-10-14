import 'reflect-metadata'
import * as Koa from 'koa'
import './inversify.config'
import {buildKoaServe} from '../../src'

const app = new Koa()
buildKoaServe(app, {})

export {app}
