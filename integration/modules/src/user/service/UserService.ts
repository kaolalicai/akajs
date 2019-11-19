import {Service, LazyInject} from '@akajs/core'
import {UserModel} from '../model/User'

@Service('UserService')
export class UserService {

  @LazyInject('UserModel')
  private userModel: UserModel

  async findOneUserByName (name) {
    return this.userModel.findOne({name})
  }
}
