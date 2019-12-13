import {Context} from 'koa'
import {assign} from 'lodash'
import {decorate} from 'inversify'
import {logger} from '@akajs/utils'
import {ICurdController} from '../crud/crudController'
import {parseApiToQuery} from '../crud/resetApiUtil'
import {Controller, addRouterMetadata} from './RequestMapping'
import {router} from '../interfaces/http'

function checkModel (model) {
  if (!model) throw new Error('CRUD Controller 必须定义 crudModel')
}

export function CrudController<T extends ICurdController> (path?: string, ...middleware: router.Middleware[]) {
  return function (constructor: Function) {
    // 继承 Controller
    decorate(Controller(path, ...middleware), constructor)
    // Controller(path)(constructor)

    // 注册路由
    constructor.prototype.findAll = constructor.prototype.findAll || async function findAll (this: ICurdController, ctx: Context, parameters) {
      checkModel(this.crudModel)
      const {skip, limit, query, selectors, sorter} = parseApiToQuery(parameters)
      const list = await this.crudModel.find(query).skip(skip).limit(limit).select(selectors).sort(sorter)
      if (parameters.page) {
        const totalCount = await this.crudModel.count(query)
        ctx.body = {list, totalCount}
      } else {
        ctx.body = list
      }
    }

    addRouterMetadata({
      key: 'findAll',
      method: 'get',
      middleware: [],
      path: '/',
      target: {constructor}
    })

    constructor.prototype.findOne = constructor.prototype.findOne || async function findOne (this: ICurdController, ctx: Context) {
      checkModel(this.crudModel)
      const {itemId} = ctx.params
      logger.info(`findOne ${this.crudModel.name} ${itemId}`)
      const one = await this.crudModel.findById(itemId)
      if (!one) throw new Error('找不到 ' + path + ' id:' + itemId)
      ctx.body = one
    }
    addRouterMetadata({
      key: 'findOne',
      method: 'get',
      middleware: [],
      path: '/:itemId',
      target: {constructor}
    })

    constructor.prototype.create = constructor.prototype.create || async function create (this: ICurdController, ctx: Context, itemDto) {
      logger.info(`create ${this.crudModel.name} `, itemDto)
      checkModel(this.crudModel)
      ctx.body = await new this.crudModel(itemDto).save()
    }
    addRouterMetadata({
      key: 'create',
      method: 'post',
      middleware: [],
      path: '/',
      target: {constructor}
    })

    constructor.prototype.update = constructor.prototype.update || async function update (this: ICurdController, ctx: Context, itemDto) {
      checkModel(this.crudModel)
      const itemId = ctx.params.itemId
      logger.info(`update ${this.crudModel.name} ${itemId} `, itemDto)
      const one = await this.crudModel.findById(itemId)
      if (!one) throw new Error('找不到 ' + path + ' ' + itemId)
      assign(one, itemDto)
      ctx.body = await one.save()
    }
    addRouterMetadata({
      key: 'update',
      method: 'put',
      middleware: [],
      path: '/:itemId',
      target: {constructor}
    })

    constructor.prototype.remove = constructor.prototype.remove || async function remove (this: ICurdController, ctx: Context) {
      checkModel(this.crudModel)
      const itemId = ctx.params.itemId
      logger.info(`delete ${this.crudModel.name} ${itemId}`)
      const one = await this.crudModel.findById(itemId)
      if (!one) throw new Error('找不到 ' + path + ' ' + itemId)
      await this.crudModel.remove({_id: itemId})
      ctx.body = 'success'
    }
    addRouterMetadata({
      key: 'remove',
      method: 'delete',
      middleware: [],
      path: '/:itemId',
      target: {constructor}
    })
  }
}
