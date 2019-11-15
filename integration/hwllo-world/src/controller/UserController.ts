import {Controller, Get, Inject, DTO,Post} from '@akajs/core'
import {logger} from '@akajs/utils'
import {UserService} from '../service/UserService'
import {MinLength,Min,IsOptional,Max,MaxLength} from 'class-validator'
import {PaginationDto} from '../dto'

class UserDto {
  @MinLength(1,{message: 'name can not be empty'})
  name: string
}

class UserPagination extends PaginationDto {
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
  async save (ctx, @DTO(UserPagination) {name}): Promise<{
    obj: {
      value: {
        name: string
        title: number
        data: string[]
      }
    },
    desc: string,
    list: {num: number,msg: string}[]
  }> {
    return ctx.body = {obj: {value: {name: 'deo',title: 111,data: []}},desc: 'desc string',list: [{num: 1,msg: 'message'}]}
  }
}
