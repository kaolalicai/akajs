import {Controller,Post} from '@akajs/core'
import {RedLock,Redis} from '@akajs/redis'
import * as Bluebird from 'bluebird'

@Controller('/redis')
export class RedisController {

  @Post('/set')
  async set (ctx) {
    const {key,value} = ctx.parameters
    await Redis.set(key,value)
    ctx.body = await Redis.get(key)
  }

  @Post('/mutex')
  async mutex (ctx) {
    await RedLock.mutex('mutex',async () => {
      await Bluebird.delay(1000)
    })
    ctx.body = 'return'
  }

  @Post('/buffer')
  async buffer (ctx) {
    await RedLock.buffer('buffer',async () => {
      await Bluebird.delay(1000)
    },ctx)
    ctx.body = 'return'
  }
}
