import {LazyInject, Autowired} from '@akajs/ioc'
import {logger} from '@akajs/utils'
import {Get, Post, CrudController, ICurdController} from '@akajs/web'
import {UserModel} from '../model/User'
import {UserService} from '../service/UserService'

@CrudController('/user')
export class UserController implements ICurdController {

  @LazyInject('UserModel')
  public crudModel: UserModel

  @Autowired()
  public userService: UserService

  @Get('/hello/:name')
  async hello (ctx) {
    const {name} = ctx.params
    ctx.body = 'hello ' + name
  }

  @Post('/transactionDemo')
  async transactionDemo (ctx) {
    try {
      ctx.body = await this.userService.transactionDemo('ok')
    } catch (err) {
      logger.error(err)
    }
  }

  @Post('/transactionRollbackDemo')
  async transactionRollbackDemo (ctx) {
    ctx.body = await this.userService.transactionRollbackDemo()
  }
}
