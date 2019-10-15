import {Application} from '@akajs/core'
import {MongoModelBuilder} from '@akajs/mongoose'
// 必须导入，注意顺序，后期考虑自动化引入方案
import './model'
new MongoModelBuilder().build()
import './controller'

const app: Application = new Application({})
export {app}
