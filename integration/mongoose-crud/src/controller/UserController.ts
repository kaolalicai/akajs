import {Get, Inject} from '@akajs/core'
import {CrudController, ICurdController} from '@akajs/crud'
import {UserModel} from '../model'

@CrudController('/user')
export class UserController implements ICurdController {

  @Inject('UserModel')
  public crudModel: UserModel

  @Get('/hello/:name')
  async hello (ctx) {
    const {name} = ctx.params
    ctx.body = 'hello ' + name
  }
}
