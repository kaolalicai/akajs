import {Controller, Get, DTO, Post} from '@akajs/web'
import {Inject} from '@akajs/ioc'
import {logger} from '@akajs/utils'
import {UserService} from '../service/UserService'
import {MinLength} from 'class-validator'

class UserDto {
  @MinLength(1,{message: 'name can not be empty'})
  name: string
}

@Controller('/user')
export class UserController {

  @Inject('UserService')
  private userService: UserService

  @Get('/hello/:name')
  async hello (ctx) {
    const {name} = ctx.params
    logger.debug('hello', name)
    ctx.body = await this.userService.hello(name)
  }

  @Post('/testDto')
  async save (ctx, @DTO(UserDto) {name}) {
    ctx.body = 'success'
  }
}
