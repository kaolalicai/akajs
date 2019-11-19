import {UserService} from './service/UserService'
import {Service, Inject} from '@akajs/core'

@Service('UserModule')
export class UserModule {
  @Inject('UserService')
  userService: UserService
}
