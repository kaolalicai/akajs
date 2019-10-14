// 顺序很重要

import {User, UserModel} from './UserModel'
import {buildProviderModule, container} from '../../src'
import {TYPES} from './inversify.container'
container.bind<UserModel>(TYPES.User).toConstantValue(container.resolve(User).build())
import './UserController'

// provide 注入要手动注册
container.load(buildProviderModule())
