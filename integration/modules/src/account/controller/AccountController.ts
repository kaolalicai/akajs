import {Get, Controller, Inject} from '@akajs/core'
import {UserModule} from '../../user'

@Controller('/account')
export class AccountController {
  @Inject('UserModule')
  public userModule: UserModule

  @Get('/findUser')
  async findUser (ctx) {
    const {name} = ctx.parameters
    const user = await this.userModule.userService.findOneUserByName(name)
    ctx.body = user
  }
}
