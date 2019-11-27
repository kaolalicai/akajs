import * as config from 'config'
import {colorConsole, dailyfile} from 'tracer'

const defaultLogConfig: any = {
  level: 'info',
  dateformat: 'yyyy-mm-dd HH:MM:ss.L',
  inspectOpt: {
    showHidden: false, // if true then the object's non-enumerable properties will be shown too. Defaults to false
    depth: 5 // tells inspect how many times to recurse while formatting the object. This is useful for inspecting large complicated objects. Defaults to 2. To make it recurse indefinitely pass null.
  }
}

if (config.has('log')) {
  Object.assign(defaultLogConfig, config.get('log'))
}

console.log('defaultLogConfig', defaultLogConfig)

let logger = colorConsole(defaultLogConfig)
// 指定了存储地址的的要按日分割
if (config.has('log.root')) {
  defaultLogConfig.transport = function (data) {
    console.log(data.output)
  }
  logger = dailyfile(defaultLogConfig)
}

export {logger}
