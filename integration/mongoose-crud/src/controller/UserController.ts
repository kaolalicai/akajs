import {Get, Inject, LazyInject} from '@akajs/core'
import {CrudController, ICurdController} from '@akajs/crud'
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
