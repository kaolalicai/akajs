import {Context} from 'koa'

export interface ICrudModel {
  save (): Promise<ICrudModel>
}

export interface ICrudDocument {
  new (doc?: object): ICrudModel

  findById (id: string)

  find (conditions: any)

  count (conditions: any)

  remove (conditions: any)
}

export interface ICurdController {
  crudModel: ICrudDocument

  create? (ctx: Context, itemDto): Promise<void>

  findAll? (ctx: Context, parameters): Promise<void>

  findOne? (ctx: Context): Promise<void>

  update? (ctx: Context): Promise<void>

  remove? (ctx: Context): Promise<void>
}
