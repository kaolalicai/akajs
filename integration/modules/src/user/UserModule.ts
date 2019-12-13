import {UserService} from './service/UserService'
import {Service, Inject} from '@akajs/ioc'

@Service('UserModule')
export class UserModule {
  @Inject('UserService')
  userService: UserService
}
