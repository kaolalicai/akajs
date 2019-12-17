import {createNamespace} from 'cls-hooked'
import {ClientSession} from 'mongoose'
import {MongooseConnection} from '../MongooseConnection'

const ns = createNamespace('Transactional')

export function getSession (): ClientSession {
  const session = ns.get('session')
  // if (!session) throw new Error('getSession 需要在方法中启用 @Transactional')
  return session
}

export function Transactional (options?: { connectionName?: string }): MethodDecorator {
  return (target: any, methodName: string | symbol, descriptor: TypedPropertyDescriptor<any>) => {
    const originalMethod = descriptor.value
    descriptor.value = async function (...args: any[]) {
      // const runOriginal = async () => originalMethod.apply(this, [...args])
      return await ns.runAndReturn(async () => {
        let db = MongooseConnection.getInstance().defaultCon
        if (options && options.connectionName) {
          const temp = MongooseConnection.getInstance().dbs.get(options.connectionName)
          if (!temp) throw new Error(`connection ${options.connectionName} not exists`)
          db = temp
        }
        if (ns.get('session')) throw new Error('请不要嵌套使用事务')
        const session = await db.startSession()
        session.startTransaction()
        ns.set('session', session)
        try {
          const value = await originalMethod.apply(this, [...args])
          // Since the mutations ran without an error, commit the transaction.
          await session.commitTransaction()
          // Return any value returned by `mutations` to make this function as transparent as possible.
          return value
        } catch (error) {
          // Abort the transaction as an error has occurred in the mutations above.
          await session.abortTransaction()
          // Rethrow the error to be caught by the caller.
          throw error
        } finally {
          // End the previous session.
          session.endSession()
        }
      })
    }
  }
}
