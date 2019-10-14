import {CrudController, ICurdController, inject} from '../../src'
import {TYPES} from './inversify.container'
import {UserModel} from './UserModel'

@CrudController('/user')
export class UserController implements ICurdController {

  @inject(TYPES.User)
  crudModel: UserModel
}
