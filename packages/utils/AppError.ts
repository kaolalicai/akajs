import * as util from 'util'

const ErrorInfo = {
  UNKNOWN_ERROR: '未知错误',
  NOT_EXIST: '%s不存在:%s',
  EXIST: '%s已存在',
  REPEAT_ORDER: '订单不可重复提交 %s'
}

const ErrorCode = {
  DEFAULT: 1,
  REQUEST_REPEAT: 1501,
  ORDER_REPEAT: 1502,
  SYS_ERROR: 1504,
  NOT_ENOUGH: 1505            // 余额不足
}

function buildMsg (message: string, ...params) {
  return util.format(message, ...params)
}

export class AppError extends Error {
  static ERRORS = ErrorInfo
  static CODES = ErrorCode
  static BuildMsg = buildMsg

  code: number
  message: string

  constructor (message: string = ErrorInfo.UNKNOWN_ERROR, ...params) {
    super()
    this.code = ErrorCode.DEFAULT
    this.message = message
  }
}
