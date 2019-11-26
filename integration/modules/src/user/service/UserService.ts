import {Service, LazyInject} from '@akajs/core'
import {UserModel} from '../model/User'
import {Inject} from '../../../../../packages/core/decorators'
import {RecordModel} from '../model/Record'

@Service('UserService')
export class UserService {

  @LazyInject('UserModel')
  private userModel: UserModel

  @Inject('RecordModel')
  private recordModel: RecordModel

  async findOneUserByName (name) {
    const record = await this.recordModel.findOne({})
    return this.userModel.findOne({name})
  }
}
