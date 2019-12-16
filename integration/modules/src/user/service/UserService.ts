import {Service, Autowired} from '@akajs/ioc'
import {UserModel} from '../model/User'
import {RecordModel} from '../model/Record'

@Service('UserService')
export class UserService {

  @Autowired()
  private userModel: UserModel

  @Autowired()
  private recordModel: RecordModel

  async findOneUserByName (name) {
    const record = await this.recordModel.findOne({})
    return this.userModel.findOne({name})
  }
}
