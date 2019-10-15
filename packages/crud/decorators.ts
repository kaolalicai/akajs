import {Context} from 'koa'
import {assign} from 'lodash'
import {addRouterMetadata, Controller} from '@akajs/core'
import {decorate} from 'inversify'
import {ICurdController} from './crudController'

function checkModel (model) {
  if (!model) throw new Error('CRUD Controller 必须定义 crudModel')
}

export function CrudController<T extends ICurdController> (path?: string) {
  return function (constructor: Function) {
    // 继承 Controller
    decorate(Controller(path), constructor)
    // Controller(path)(constructor)

    // 注册路由
    constructor.prototype.findAll = constructor.prototype.findAll || async function findAll (this: ICurdController, ctx: Context, parameters) {
      checkModel(this.crudModel)
      ctx.body = await this.crudModel.find(parameters)
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
