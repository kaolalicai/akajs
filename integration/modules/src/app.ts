import {Application} from '@akajs/core'
import {initMongoose} from '@akajs/mongoose'

// mongoose 最好先导入
initMongoose('src/**/model/*.ts')
const app: Application = new Application({
  controllersPath: 'src/**/controller/*.ts'
})
export {app}
