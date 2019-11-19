import {logger} from '@akajs/utils'
import * as glob from 'glob'
import * as path from 'path'
import {MongoModelBuilder} from './MongoModelBuilder'

export function initMongoose (entities?: string) {
  glob(entities || 'src/model/*.*', function (er, files) {
    files.forEach(file => {
      let name = file.replace('.ts', '')
      logger.debug('scan model file ', path.join(process.cwd(), name))
      // logger.debug('scan file ', name)
      require(path.resolve(path.join(process.cwd(), name)))
    })
    new MongoModelBuilder().build()
  })
}
