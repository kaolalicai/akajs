import {DynamicModule, Module} from '@nestjs/common'
import * as mongoose from 'mongoose'
import {TypegooseModule} from 'nestjs-typegoose'
import {parseConfig} from './ConfigParse'

@Module({})
export class TypegooseModuleBuilder {
  static forRoot (): DynamicModule {
    let {mongoConfigs, debugMongoose} = parseConfig()

    mongoose.set('debug', debugMongoose)

    let connections = []
    for (let c of mongoConfigs) {
      let typegooseModule = TypegooseModule.forRoot(c.url, Object.assign({connectionName: c.name}, c.options))
      // connections.push(...typegooseModule.imports)
      connections.push(typegooseModule)
    }
    return {
      module: TypegooseModuleBuilder,
      imports: connections
    }
  }
}
