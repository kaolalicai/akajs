import * as http from 'http'
import * as supertest from 'supertest'
import {app} from '../fixtures/app'

const server = http.createServer(app.callback())

export const request = supertest.agent(server)
