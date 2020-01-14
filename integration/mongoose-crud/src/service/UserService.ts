import {Service, LazyInject} from '@akajs/ioc'
import {Transactional, getSession} from '@akajs/mongoose'
import {UserModel} from '../model/User'
import * as assert from 'assert'
import {BizError} from '@akajs/utils'

@Service()
export class UserService {
  @LazyInject('UserModel')
  public userModel: UserModel

  @Transactional()
  async transactionDemo (key) {
    await this.userModel.createCollection()
    await new this.userModel({phone: 'p1'}).save({session: getSession()})
    const doc1 = await this.userModel.findOne({phone: 'p1'})
    assert.ok(!doc1)
    await this.step2()
    return key
  }

  async step2 () {
    const doc2 = await this.userModel.findOne({phone: 'p1'}).session(getSession())
    assert.ok(doc2)
    await this.userModel.remove({}).session(getSession())
  }

  async transactionRollbackDemo () {
    await this.userModel.createCollection()
    await this.rollback()
    const doc1 = await this.userModel.findOne({phone: 'p2'})
    assert.ok(!doc1)
    return 'rollback'
  }

  @Transactional()
  async rollback () {
    await this.userModel.createCollection()
    await new this.userModel({phone: 'p2'}).save({session: getSession()})
    const doc1 = await this.userModel.findOne({phone: 'p2'}).session(getSession())
    assert.ok(doc1)
    throw new BizError('Error')
  }
}
