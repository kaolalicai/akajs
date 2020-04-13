import {Types} from 'mongoose'
export function ObjectId (id?: string): Types.ObjectId {
  return Types.ObjectId(id)
}
