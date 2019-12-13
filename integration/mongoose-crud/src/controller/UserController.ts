import {LazyInject} from '@akajs/ioc'
import {Get, CrudController, ICurdController} from '@akajs/web'
import {UserModel} from '../model/User'

@CrudController('/user')
export class UserController implements ICurdController {

  @LazyInject('UserModel')
  public crudModel: UserModel

  @Get('/hello/:name')
  async hello (ctx) {
    const {name} = ctx.params
    ctx.body = 'hello ' + name
  }
}
