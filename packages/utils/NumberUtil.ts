import * as _ from 'lodash'

export class NumberUtil {
  static defaultDigits = 2

  static setDigits (digits) {
    this.defaultDigits = digits
  }

  static add (a: number, b: number) {
    return this.fixNumPrecision(a + b)
  }

  static sub (a: number, b: number) {
    return this.fixNumPrecision(a - b)
  }

  static fixedNumUp (num: number, digits = NumberUtil.defaultDigits) {
    return parseFloat(Number(num + 5 / Math.pow(10, digits + 1)).toFixed(digits))
  }

  /**
   * 判断数字是否接近0
   * @param {number} a
   * @returns {boolean}
   */
  static closeToZero (a: number) {
    // TODO  非空判断
    return a < 0.1
  }

  /**
   * 四舍五入
   * 1. 为什么不用 toFixed ？toFixed return string 这个方法 return number
   * 2. 为什么不用 Math.round ？不支持指定小数位
   * @param num
   * @param digits 默认2
   * @returns {number}
   */
  static fixedNum (num: number, digits = NumberUtil.defaultDigits) {
    return _.round(num, digits)
  }

  /**
   * 修复 0.1 + 0.2 = 0.30000000000000004 的这类数字
   * @param {number} num
   * @returns {number}
   */
  static fixNumPrecision (num: number): number {
    const left = Math.abs(num - this.fixedNum(num))
    // 是 0.30000000000000004 的情况才 fix
    if (left < 1e-10) {
      return this.fixedNum(num)
    }
    return num
  }

  /**
   * 遍历 Object 的属性，找出所有 number 类型的属性并 fixNumPrecision
   * @param {object} obj
   * @returns object
   */
  static fixObj<T extends object> (obj: T): T {
    if (!obj) return obj
    for (let key of Object.keys(obj)) {
      if (typeof (obj[key]) === 'number') {
        obj[key] = this.fixNumPrecision(obj[key])
      }
      if (typeof (obj[key]) === 'object') {
        obj[key] = this.fixObj(obj[key])
      }
    }
    return obj
  }

  /**
   * 截取 digits 位小数 不做四舍五入
   * @param num
   * @param digits
   * @returns {number}
   */
  static cutNum (num: number, digits = NumberUtil.defaultDigits) {
    num = this.fixNumPrecision(num)
    return _.floor(num, digits)
  }
}
