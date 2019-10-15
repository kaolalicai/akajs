import {Application} from '@akajs/core'
import '@akajs/mongoose'

import './controller/UserController'

const app: Application = new Application({})
export {app}
