import {Controller, Get} from '@akajs/core'
import {logger} from '@akajs/utils'

@Controller('/user')
export class UserController {

  @Get('/hello/:name')
  async hello (ctx) {
    const {name} = ctx.params
    logger.debug('hello', name)
    ctx.body = 'hello ' + name
  }
}
