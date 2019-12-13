import {logger} from '@akajs/utils'
import * as _ from 'lodash'
import {RedisConnection} from './RedisConnection'
import {Redlock as redlock} from 'klg-redlock'
import * as config from 'config'
import {IRedlockConfig} from './interface'
import { Context } from 'koa'
const client = RedisConnection.getInstance().client

let defaultRedlockConfig = {}
try {
  defaultRedlockConfig = config.get('redlock')
} catch (e) {
  logger.warn(`找不到config.redlock  建议配置config.redlock`)
}

class Redlock {
  private prefix: string
  private retryCount: number
  private retryDelay: number
  private bufferRedlock: redlock
  private mutexRedlock: redlock

  constructor (redlockConfig?: IRedlockConfig) {
    if (_.isEmpty(redlockConfig)) redlockConfig = defaultRedlockConfig
    this.prefix = redlockConfig.prefix || 'defaultRedlock'
    this.retryCount = redlockConfig.retryCount || 5
    this.retryDelay = redlockConfig.retryDelay || 400

    this.bufferRedlock = new redlock({client,retryConfig: {retryCount: this.retryCount,retryDelay: this.retryDelay}})
    this.mutexRedlock = new redlock({client,retryConfig: {retryCount: 0}})
  }

  private async using (redlock: redlock,func: Function,funcParam: { ttl?: number, resource: string, ctx?: any }) {
    funcParam.ttl = _.toInteger(funcParam.ttl) || 1000 * 60
    let lock = null
        // 尝试上锁
    try {
      lock = await redlock.lock(this.prefix + funcParam.resource,func,funcParam.ttl)
      if (funcParam.ctx) funcParam.ctx.redLock = lock
      logger.info('lock success ', lock.resource)
    } catch (e) {
      logger.error('lock Error ', e)
      throw new Error('系统繁忙')
    }

    // 执行业务逻辑
    try {
      await func()
    } catch (e) {
        // 出现业务错误也要解锁
      await lock.unlock()
      logger.info('unlock success ', lock.resource)
      throw e
    }

    // 解锁
    try {
      await lock.unlock()
      logger.info('unlock success ', lock.resource)
    } catch (e) {
      logger.error('unlock Error ', e)
    }
  }

  /**
   * 该锁会重试,但顺序不确定
   * @param resource
   * @param func
   * @param ctx
   */
  async buffer (resource: string,func: Function,ctx: Context) {
    await this.using(this.bufferRedlock,func,{resource,ctx})
  }

  /**
   * 注意该锁不会重试,如果上锁失败直接抛出错误
   * @param resource 锁定的资源
   * @param func 待执行函数
   * @param ttl 锁持有时间 单位:秒
   */
  async mutex (resource: string,func: Function,ttl?: number) {
    await this.using(this.mutexRedlock,func,{resource,ttl})
  }
}

export const RedLock = new Redlock()
