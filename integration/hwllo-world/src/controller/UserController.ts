import {Controller, Get, Inject} from '@akajs/core'
import {logger} from '@akajs/utils'
import {UserService} from '../service/UserService'

@Controller('/user')
export class UserController {

  @Inject('UserService')
  private userService: UserService

  @Get('/hello/:name')
  async hello (ctx) {
    const {name} = ctx.params
    logger.debug('hello', name)
    ctx.body = await this.userService.hello(name)
  }
}
