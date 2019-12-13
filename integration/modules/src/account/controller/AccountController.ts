import {Get, Controller} from '@akajs/web'
import {Inject} from '@akajs/ioc'
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
