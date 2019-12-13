import {cloneDeep, last, get} from 'lodash'
import {container} from '@akajs/ioc'
import ObjectID from 'bson-objectid'

function getUserId (ctx, response) {
  const userId = get(ctx.parameters, 'userId') || get(ctx.parameters, 'ud') || get(ctx.parameters, 'data.userId')
  if (userId) {
    return userId
  } else {
    return get(response, 'userId') || get(response, 'ud') || get(response, 'data.userId') || 'none'
  }
}

function formatResponse (response) {
  if (JSON.stringify(response).length >= 1000) {
    return '内容过大，不予记录'
  } else {
    return response
  }
}

export async function requestLog (ctx, next) {
  let response = null
  const time = Date.now()
  if (ctx.parameters && !ctx.parameters.orderId) {
    ctx.parameters.orderId = new ObjectID().toString()
  }
  try {
    await next()
  } catch (err) {
    response = {err: err.message, stack: err.stack}
    throw err
  } finally {
    if (['GET', 'OPTION'].includes(ctx.req.method)) return
    if (!container.isBound('LogModel')) return
    response = response || ctx.body
    const userId = getUserId(ctx, response)
    const body = cloneDeep(ctx.request.body)
    let log = {
      time,
      userId: userId,
      orderId: ctx.parameters.orderId,
      httpMethod: ctx.req.method,
      useTime: Date.now() - time,
      type: 'in',
      body: body,
      url: ctx.url,
      interfaceName: last(ctx.url.split('?')[0].split('/')),
      response: formatResponse(response)
    }
    await (container.get('LogModel') as any).create(log)
  }
}
