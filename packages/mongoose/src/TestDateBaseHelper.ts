import {Module, INestApplication} from '@nestjs/common'
import {logger} from '@akajs/utils'
import {getModelToken, getConnectionToken} from 'nestjs-typegoose'
import * as Mock from 'mockjs'
import {parseConfig} from './ConfigParse'

@Module({})
export class TestDateBaseHelper {

  static async genFixtures (app: INestApplication, template: object, nums: number, modelName: string, fixData?: (it: object, i: number) => any) {
    if (!fixData) fixData = (it: object, index: number) => it
    let model = app.get(getModelToken(modelName))
    let items = Array(10)
      .fill(0)
      .map((it: object) => Mock.mock(template))
      .map(fixData)
    logger.debug('initFixtures ', items.length)
    await model.create(items)
    return items
  }

  static async clearDatabase (app: INestApplication) {
    const {mongoConfigs} = parseConfig()
    for (let c of mongoConfigs) {
      let connect = app.get(getConnectionToken(c.name))
      for (let key of Object.keys(connect.collections)) {
        logger.debug('delete ', key)
        await connect.collections[key].deleteMany({})
      }
    }
  }
}
