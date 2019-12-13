import {LazyInject} from '@akajs/ioc'
import {CrudController, ICurdController} from '@akajs/web'
import {UserModel} from '../model/User'

@CrudController('/user')
export class UserController implements ICurdController {

  @LazyInject('UserModel')
  public crudModel: UserModel
}
