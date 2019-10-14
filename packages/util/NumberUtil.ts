import {NumberUtil as NumberUtilOrigin} from 'klg-number'

export class NumberUtil extends NumberUtilOrigin {

  static fixedNumUp (num: number, digits = 2) {
    return parseFloat(Number(num + 5 / Math.pow(10, digits + 1)).toFixed(digits))
  }
}
