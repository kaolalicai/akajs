import {Service} from '@akajs/ioc'

@Service('UserService')
export class UserService {

  async hello (name) {
    return 'hello ' + name
  }
}
