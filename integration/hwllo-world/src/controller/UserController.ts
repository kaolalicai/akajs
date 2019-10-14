import {Controller, ICurdController} from '@aka/common'

@Controller('/user')
export class UserController implements ICurdController {

  @Get('hello')
  async hello(ctx){

  }
}
