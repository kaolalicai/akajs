import {LazyInject} from '@akajs/core'
import {CrudController, ICurdController} from '@akajs/crud'
import {UserModel} from '../model/User'

@CrudController('/user')
export class UserController implements ICurdController {

  @LazyInject('UserModel')
  public crudModel: UserModel
}
