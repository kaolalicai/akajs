import {Controller, Get} from '@akajs/core'

@Controller('/user')
export class UserController {

  @Get('/hello/:name')
  async hello (ctx) {
    const {name} = ctx.params
    ctx.body = 'hello ' + name
  }
}
