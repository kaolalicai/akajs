import {Application} from '@akajs/core'
import '../tsQueryTest'
import './controller/MiddlewareController'
import './controller/UserController'

const app: Application = new Application({})
export {app}
