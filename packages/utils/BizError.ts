import {format} from 'util'

export class BizError extends Error {
  code: number
  message: string

  constructor (msg: string, ...values: Array<any>)
  constructor (code: number, msg: string, ...values: Array<any>)
  constructor (paramOne?: string | number, paramTwo?: string, ...values: Array<any>) {
    super()
    // new BizError('msg')
    if (typeof paramOne === 'string' && typeof paramTwo === 'undefined') {
      this.message = paramOne
      return
    }
    // new BizError('hello %s', 'world')
    // new BizError('hello %s $s', 'world', 233)
    if (typeof paramOne === 'string' && typeof paramTwo === 'string') {
      this.message = format(paramOne, paramTwo, ...values)
      return
    }
    // new BizError(1, 'world')
    if (typeof paramOne === 'number' && typeof paramTwo === 'string' && values.length === 0) {
      this.code = paramOne
      this.message = paramTwo
      return
    }
    // new BizError(1, 'world  %s', 'world')
    if (typeof paramOne === 'number' && typeof paramTwo === 'string' && values.length > 0) {
      this.code = paramOne
      this.message = format(paramTwo, ...values)
      return
    }
  }
}

// const c = new BizError('error')
// const a = new BizError(1, 'he')
// const b = new BizError(1, 'he', 2, 3)
