// logger 工厂，给用户自定义
import {colorConsole, dailyfile} from 'tracer'
import {defaultLogConfig} from './LoggerConfig'

export function LogFactory (config?) {
  Object.assign(defaultLogConfig, config)
  let logger = colorConsole(defaultLogConfig)
  // 指定了存储地址的的要按日分割
  if (defaultLogConfig && defaultLogConfig.root) {
    defaultLogConfig.transport = function (data) {
      console.log(data.output)
    }
    logger = dailyfile(defaultLogConfig)
  }
  return logger
}
