import {Service} from '@akajs/core'

@Service('UserService')
export class UserService {

  async hello (name) {
    return 'hello ' + name
  }
}
