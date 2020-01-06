import * as _ from 'lodash'
import {assert} from 'chai'
import {NumberUtil} from './NumberUtil'

describe('NumberUtil.8digits.spec', async function () {

  before(' setDigits ', async () => {
    NumberUtil.setDigits(8)
  })

  it(' fixedNum ', async () => {
    assert.ok(_.isNumber(NumberUtil.fixedNum(2.335)))
    assert.equal(NumberUtil.fixedNum(2.3351), 2.3351)
    assert.equal(NumberUtil.fixedNum(2.33333333333333), 2.33333333)
    assert.equal(NumberUtil.fixedNum(2.333351, 4), 2.3334)

    assert.equal(NumberUtil.fixedNum(234.4545, 2), 234.45)
    assert.equal(NumberUtil.fixedNum(-234.4445678654), -234.44456787)
  })

  it(' cutNum ', async () => {
    assert.equal(NumberUtil.cutNum(0.1 + 0.2), 0.3)
    assert.equal(NumberUtil.cutNum(10 / 3), 3.33333333)
    assert.equal(NumberUtil.cutNum(32764.999999999996), 32765)
  })

  it(' fixNumPrecision ', async () => {
    assert.ok(_.isNumber(NumberUtil.fixNumPrecision(0.1 + 0.2)))
    assert.equal(NumberUtil.fixNumPrecision(0.1 + 0.2), 0.3)
    assert.equal(NumberUtil.fixNumPrecision(3.0004), 3.0004)
    assert.equal(NumberUtil.fixNumPrecision(1.52999999991039), 1.53)
  })

  after(' re setDigits ', async () => {
    NumberUtil.setDigits(2)
  })
})
