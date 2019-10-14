import * as config from 'config'
import {Logger} from 'klg-logger'

export const logger = Logger({
  level: config.get('log.level'),
  dateformat: 'yyyy-mm-dd HH:MM:ss.L',
  inspectOpt: {
    showHidden: false, // if true then the object's non-enumerable properties will be shown too. Defaults to false
    depth: 5 // tells inspect how many times to recurse while formatting the object. This is useful for inspecting large complicated objects. Defaults to 2. To make it recurse indefinitely pass null.
  }
})
