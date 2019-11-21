import * as supertest from 'supertest'
import {app} from '../../src/app'

const server = app.getHttpServer()

export const request = supertest.agent(server)
