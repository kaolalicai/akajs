---
sidebarDepth: 2
---

## 目标
akajs 的目标是提供一个开箱即用的 web 服务，本质上是基于 koa，组装了常用的中间件，搭配上 ORM、redis 等工具。
此外还通过项目模板的方式，展示一些 Web项目的最佳实践。

## akajs 的主要模块
- @akajs/web ： 提供 koa 相关的功能，包括 crud 自动生成
- @akajs/ioc ： 提供容器和依赖注入实现
- @akajs/mongoose ： 基于 typegoose 提供更简单的 orm
- @akajs/utils ： 常用工具，详细见后文

## 常用的 Koa 中间件
akajs 通用一下方式来初始化 koa 服务。

```ts
import {Application} from '@akajs/web'

const app: Application = new Application({})
export {app}

```
初始化 Application 的时候，会新建 koa 对象，并挂载常用中间件进去，最后再把注解式的路由绑定到 koa 中。

所以，你也可以分步地完成这个过程。

```ts
import {Application} from '@akajs/web'

const app: Application = new Application({
  autoBuild: false, // 不再自动初始化
})
// middleware
app.bodyParser()
app.requestLog()
app.assembleParameters()
app.buildMiddleware(requestLog)  // 自定义的中间件
app.formatResponse()
// app.statics()

// auto require
app.requireControllers()
// routers
app.buildRouters()
// koa.use(requestLog)
export {app}
```

因为 koa 中间件的注册顺序会对实际效果有影响的，
所以你需要自定义中间件的话，例如在 requestLog 和 formatResponse 之间插入中间件，就只能采用这种方式来初始化 koa 了。
每个中间件的作用后文都会有讲解。

## 系统配置 config
akajs 基于 [config](https://github.com/lorenwest/node-config) 这个包来实现系统配置，在项目目录下有个 config 文件夹，里面是不同环境的配置
```
config
--default.js
--dev.js
--production.js
```

## 模块化
在项目变复杂的时候，进行模块划分降低复杂度的有效方法。
在之前一些项目中，我们通过文件夹隔离的方式来实现模块化
```
src
    user
        controller
        service
        index.ts
        modules.ts
    order
        controller
        service
        index.ts
        modules.ts
```
每个模块都有自己的 mvc，使用 index.ts 来向外暴露方法，使用 modules.ts 来声明引入其他模块
在 order 模块里使用 user 模块就像这样：

```ts
import {userModule} from '../modules'

await userMoudle.findUser()
```
这个方式足够简单，但是需要开发自觉维护规范。

akajs 引入了 IOC 机制，所以模块之间的调用方式也会发生变化。
假设有两个模块 user 和 account，在 user 里 export 模块

src/user/UserModule.ts
```ts
import {UserService} from './service/UserService'
import {Service, Inject} from '@akajs/core'

@Service('UserModule')
export class UserModule {
  @Inject('UserService')
  userService: UserService
}

```

在 account 中，直接注入即可

src/account/controller/AccountController.ts
```ts
import {Get, Controller, Inject} from '@akajs/core'
import {UserModule} from '../../user'

@Controller('/account')
export class AccountController {
  @Inject('UserModule')
  public userModule: UserModule

  @Get('/findUser')
  async findUser (ctx) {
    const {name} = ctx.parameters
    const user = await this.userModule.userService.findOneUserByName(name)
    ctx.body = user
  }
}
```
详细的代码示例见 integration/modules

**备注**：
NestJs 提供了 Module 的注解，来强制定义模块，也是不错的方法。

```ts
@Module({
  controllers: [CatsController],
  providers: [CatsService],
})
export class CatsModule {}
```

**不过在云原生时代，有了 k8s 的辅助，最好还是不要做模块化了，拆成多个服务吧，服务足够小的情况下，分工和技术升级会简单很多**

## 注解式路由

使用注解声明路由

```ts
import {Controller, Get} from '@akajs/core'

@Controller('/user')
export class UserController {

  @Get('/hello/:name')
  async hello (ctx) {
    const {name} = ctx.params
    ctx.body = 'hello ' + name
  }
}

```

注解式路由的好处是灵活直观，也方便框架控制者限定 Controller 的样式。
声明式路由（统一在一个 route 文件里定义路由）的好处在于全局总览。

akajs 使用注解式路由，是为了方便通过注解给路由注入更丰富的功能。

使用中间件
```ts
import {Controller, Get} from '@akajs/core'
import {logger} from '@akajs/utils'

const routerMiddleware = async function (ctx, next) {
  await next()
  if (isObject(ctx.body)) {
    ctx.body.info = 'inject from router middleware'
  }
}

@Controller(
  '/mid',
  async (ctx, next) => {
    logger.info('Hello from controller middleware!')
    ctx.set('Kalengo', 'inject form middleware')
    await next()
    // ctx.body.info = 'inject form middleware'
  })
export class MiddlewareController {

  @Get('/get', routerMiddleware)
  async get (ctx) {
    ctx.body = {name: 'hello'}
  }
}
```


## IOC 依赖注入

### 为什么要用 IOC

IOC 可以帮助我们实现功能解耦，不过这个要业务比较复杂的时候才需要，项目简单的时候 IOC 也可以作为单例的一种实现方式

IOC 通过 [inversify](https://github.com/inversify/InversifyJS) 这个库实现

```ts
export class WechatController {

   @inject(TYPES.BaseProxyImp)
   private wxProxy: IProxy

   async getOpenId (ctx: Context) {
     ctx.body = this.wxProxy.get()
   }
 }
```

这个例子里，我们可以给 WechatController 的 wxProxy 声明注入 Proxy 对象。
当然，前提是要在容器配置里定义好 TYPES.BaseProxyImp 对应的实例

```ts
container.bind<IProxy>(TYPES.BaseProxyImp).to(APoxy)
```
后期如果我们要更换 Proxy 的实现为 BProxy，只要保证 BProxy 能实现 IProxy 接口，我们直接在容器配置中更新配置为

```ts
container.bind<IProxy>(TYPES.BaseProxyImp).to(BPoxy)
```

这个就是为什么 IOC 能实现解耦，也是控制反转（Inversion of Control，缩写为IoC）的名字由来。

控制是指 WechatController 和 Proxy 之间的引用关系，在没有 IOC 之前，我们是通过编码来定义他们之间的关系的。
一般是这样：
```ts
export class WechatController {
   private wxProxy = new AProxy()

   async getOpenId (ctx: Context) {
     ctx.body = this.wxProxy.get()
   }
 }
```
也就是说，这段代码包含了业务逻辑和组件之间的引用关系两种内容。

当代码量上去之后，关系和业务逻辑交织在一起，
后面要改动其中某个关系就要大动干戈了，你可能要修改多处代码，还可能改错和改漏。

IOC 的目的就是把组件关系从代码里抽出来，由配置文件来定义，修改引用关系直接通过修改配置文件即可实现。

akajs 提供了以下常用的 IOC 注解

### Inject
注入对象

### LazyInject
某些待注入对象可能并不能在应用启动的时候就完成初始化，例如 Mongoose 的 Model，初始化需要些时间，我们可以是用 LazyInject 来延迟注入时机，避免启动报错

```ts

@CrudController('/user')
export class UserController implements ICurdController {

  @LazyInject('UserModel')
  public crudModel: UserModel
}

```

### Service
对 Service 类的声明与使用

UserService.ts
```ts
@Service('UserService')
export class UserService {
}
```

UserController.ts
```ts
@Controller('/user')
export class UserController {

  @Inject('UserService')
  public userService: UserService
}
```



### Autowired

大部分对象的声明和注入的 key 和变量名或者类名是一致的，也就是说，我们其实可以做到更智能的自动注入。

UserService.ts
```ts
@Service()
export class UserService {
}

User.ts
```ts
@TypeMongoModel()
export class User {
}

export type UserModel = ReturnModelType<typeof User>
```

UserController.ts
```ts
@Controller('/user')
export class UserController {

  @Autowired()
  public userService: UserService

  @Autowired()
  public userModel: UserModel
}
```

typescript 提供的注解功能有限，Autowired 可以读取到被注入的变量名字，所以可以通过名字来进行默认的注入。
在上面的例子中:
- @Service() === @Service('UserService')
- @TypeMongoModel() === @TypeMongoModel('UserModel')

而 Autowired 则默认做了以下事情：

- @Autowired() === Inject('UserService')  // 通过被注解的变量名 userService 来翻译
- @Autowired() === LazeInject('UserModel')    // 通过被注解的变量名 userModel 来翻译，如果存在 Model 关键字，则使用 LazeInject

注意，为了处理大小写问题，@Service() 自动绑定的 key 实际上是全小写的。

## 参数和返回值处理

### 请求参数处理
接口参数校验是后端经常要处理的问题，akajs 提供 DTO（数据传输对象) 帮你处理校验

定义一个 DTO 对象，用注解的方式声明对象里各个参数的校验规则, 更详细的校验规则参考 [class-validator](https://github.com/typestack/class-validator)
```ts
import {Length} from 'class-validator'

export class RegisterDto {
  @Length(10, 20)
  name?: string
  @Length(11, 11, {message: '手机号长度为11'})
  phone: string
}

```

在 Controller 里注入到参数中

```ts
@Controller('/user')
export class UserController {

  @Post('/register')
  async register (ctx: Context, @DTO(RegisterDto) dto) {
  }
}
```
@DTO 会尝试在 ctx 找到所有参数，并初始化为 RegisterDto 对象 dto, 并且会进行校验.

如果不使用 DTO，akajs 则会把 query 和 body 参数都打包到 ctx.parametes 中, 你可以自行处理

```ts
@Controller('/user')
export class UserController {
  @Post('/register')
  async register (ctx: Context) {
       log('parametes', ctx.parametes)
  }
}
```

### 统一返回值
akajs 默认会把返回值包装成 JSON 格式

```ts
{
    code:0,
    message:'xxx',
    data:{}
}
```
code = 1 代表发生了错误，当然你也可以定义自己的一套 code，

@akajs/utils 提供了 AppError 自定义错误对象。

## Mongoose 支持
akajs 默认支持 mongodb, 并且使用 mongoose 作为 orm。

通过 MongoModel 注解定义 mongoose 对象（已经废弃)

```ts
import {IBaseMongoModel, MongoModel} from '@akajs/mongoose'

export interface IUser {
  phone: string
  name: string
}

export interface IUserModel extends IUser, Document {
  // registerSuccess (): IUserModelModel
}

export type UserModel = Model<IUserModel>

const schema: Schema = new Schema({
  phone: {type: String, index: true},
  name: {type: String}
})

@MongoModel('UserModel')
export class User implements IBaseMongoModel {
  modelName = 'User'
  schema = schema
}

```
这里我们还要定义 UserModel 的类型，这样 typescript 才可以帮你做类型校验和代码提示。

以上写法最大的问题就是，Interface 和 Schema 很多是重复的，为了简化 Model 的写法，我们引入了 [Typegoose](https://github.com/szokodiakos/typegoose)

优化后的写法如下：

```ts
import {TypeMongoModel} from '@akajs/mongoose'
import {ReturnModelType} from '@typegoose/typegoose'

@TypeMongoModel()
export class User {
  phone: string
  name: string
  count: number
}

export type RecordModel = ReturnModelType<typeof User>
```

**注意** typegoose 6.x 版本进行了重大更新，npm 库也进行了迁移，如果你之前使用 typegoose 5.x，需要按照 [此文档](https://typegoose.github.io/typegoose/guides/migrate-to-6/#methods-staticmethod-instancemethod-virtuals) 进行迁移升级

================================================================

程序初始化的时候会初始化 mongoose 连接并注入 model 到容器中。

app.ts
```ts
import {initMongoose} from '@akajs/mongoose'
initMongoose()
```

mongodb 的连接配置信息在 config 中定义

```js
module.exports = {
  mongodb: {
    debug: true,
    connections: [
      {
        name: 'db',
        url: process.env.MONGODB || 'mongodb://localhost/unit-test',
        options: {}
      }
    ]
  }
}
```


定义好了 Model，就可以在 Controller 里使用了。

```ts
@CrudController('/user')
export class UserController {

  @inject('UserModel')
  private crudModel: UserModel

  async hello(){
    const user = await this.crudModel.findOne({})
  }
}
```

**注意**：这里实际注入的并不是 User 这个Class的实例，而是 mongoose 注册的 model。
**注意**：如果你需要连接多个 db 实例，请参考 integration/mongoose-crud 示例。

## Mongoose 事务（未实现）
MongoDB 4.0 开始提供了事务支持，mongoose 也提供了相应的实现，不过目前的写法还是比较繁琐，
你需要在每一个事务里做提交和回滚的处理，所以 akajs 提供了一个事务的注解来简化这个处理流程。
```ts
import * as mongoose from 'mongoose'
import {Schema} from 'mongoose'
import * as assert from 'assert'
import {Transactional, getSession} from './decorators/Transactional'

mongoose.connect('mongodb://localhost:27017,localhost:27018,localhost:27019/test?replicaSet=rs', {useNewUrlParser: true})
mongoose.set('debug', true)
let db = mongoose.connection
const Customer = db.model('Customer', new Schema({name: String}))

class ClassA {
  @Transactional()
  async main (key) {
    await new Customer({name: 'ClassA'}).save({session: getSession()})
    const doc1 = await Customer.findOne({name: 'ClassA'})
    assert.ok(!doc1)
    await new ClassB().step2()
    return key
  }
}

class ClassB {
  async step2 () {
    const doc2 = await Customer.findOne({name: 'ClassA'}).session(getSession())
    assert.ok(doc2)
    await Customer.remove({}).session(getSession())
  }
}

new ClassA().main('aaa').then((res) => {
  console.log('res', res)
  mongoose.disconnect(console.log)
}).catch(console.error)

```

@Transactional() 注解会自动提交或回滚事务（发生异常时）。
为了避免嵌套调用时，你需要一直传递 session 的尴尬~，akajs 提供全局的 getSession() 方法，
其实现原理是依赖 [Async Hooks](https://nodejs.org/api/async_hooks.html) ，是 Node 的实验性特性，
你对此介意的话，请不要在生产环境使用。


当然，在每一个需要 Session 的地方调用 getSession()  方法还是稍显累赘，我们可以通过 wrap mongoose 的各个方法，
来实现自动注入 session，但是工作量有些多，暂时没时间做。

## CRUD
通过 CrudController 注解一键生成增查删改接口，restful 风格

```ts
@CrudController('/user')
export class UserController {
  // 必须指定 crudModel
  @inject(TYPES.UserModel)
  private crudModel: UserModel
}
```

CrudController 会在 UserController的 prototype 注入4个方法，你也可以重写这些方法。

### create
```
POST /:model
```
在 body 传入 json 格式的 model 即可
### findAll
```
GET /:model
```
查询接口支持分页，详细见测试 integration/mongoose-crud/e2e/user.page.spec.ts
详细的查询参数

| 参数 | 类型 | 描述 |
| --- | --- | --- |
| model | String | model 名字 |
| _*_ | String? | 简易的过滤参数，e.g. GET /purchase?amount=99.99 |
| where | String? | json 格式的 mongoose 查询条件，e.g. ?where={"name" : {"$eq" : "hello"}} |
| limit | Number? | 单页记录数 e.g. ?limit=100 |
| page | Number? | 页码 e.g. ?page=1 |
| sort | Number? | 排序，目前只支持单字段排序 e.g. ?sort=lastName%20ASC |
| select | Number? | 挑选字段，逗号分隔 e.g. ?select=name,age |
| omit | Number? | 不返回字段，逗号分隔 e.g. ?omit=phone |


注意，当传入 page 参数是，返回体格式是：
```js
{
    code : 0
    body : {
        list : [items]
        totalCount : 30
    }
}
```
默认则是
```js
{
    code : 0
    body : [items]
}
```

### findOne
```
GET /:model/:id
```
查询单条记录

### updateOne
```
PUT /:model/:id
```
在 body 传入 json 格式的 model 即可

### remove
```
DELETE /:model/:id
```


## 自动加载机制
Node 应用由模块组成，采用 CommonJS 模块规范。CommonJS 的加载过程是树状的，我们以 integration/mongoose-crud 示例项目为例，
过一遍加载顺序。
我们通过以下命令：

```bash
npm run dev
```
来启动服务，实际指向的文件是 src/main.ts
如果我们想要 src/model/User.ts 这个文件被 v8 加载，那么前提是 src/main.ts 对其有直接或者间接的引用关系。
在引入 IOC 之前，这个引用链条是：

> main.ts --> app.ts --> router.ts --> controller.ts --> service.ts --> User.ts

引入 IOC 之后

> main.ts --> app.ts --> router.ts <... IOC ...> controller.ts --> service.ts <... IOC ..> User.ts

Service 中的 User 是注入的，并非直接的引用关系，这样 v8 就不会加载 User.ts 了。

router 中的 controller 是注入的，并非直接的引用关系，这样 v8 就不会加载 controller 了。

所以我们需要自动加载机制。在初始化项目的地方：

```ts
import {Application} from '@akajs/core'
import {initMongoose} from '@akajs/mongoose'

// mongoose 最好先导入, mognoose 链接 db 需要时间
initMongoose()
const app: Application = new Application({})
export {app}

```
initMongoose 方法默认会遍历 'src/model/\*.ts' （如果是多模块项目，可以指定遍历路径，详细见 integration/modules, 文件过滤规则语法参考 [glob](https://github.com/isaacs/node-glob) ）
同时，Application 在初始化的时候也会遍历 'src/controller/\*.ts' 。

通过这两个遍历功能，才能保证所有代码被正确加载。

如果你在开发过程中，有部分代码是通过注入的，无法被加载的话，你只需要在合适的位置显示 import 即可。
例如在 app.ts
```ts
import './service/UserService'
```


## Logger
### logger to file
akajs 默认配置了 request log，所有 http 请求都会输出 log，背后实现是 morgan 这个中间件

`2019-11-27 18:14:19.48 <info> Application.js:51 () POST /api/v1/user 200 227 - 3.428 ms`

此外，在应用层，我们可以使用 logger 对象来打印 log

```ts
import { logger } from '@akajs/utils'

logger.info(`findOne ${this.crudModel.name} ${itemId}`)
```

如果需要把 logger 文件写入到文件中，直接修改 config 里的配置
```js
log: {
    level: 'info',
    root: './logs',
    allLogsFileName: 'mongoose'
}
```
root 就是文件保存的路径。
allLogsFileName 是文件名。
日志默认会按日分割。

更详细的配置见 logger 的底层实现库 [tracer](https://github.com/baryon/tracer), 这个库的优势是可以打印 log 发生的文件位置

如果你需要自定义的 logger，直接用新的 config 构造一个 logger 就行。

```ts
import { logger } from '@akajs/utils'
const logger = LoggerFactory(config)
```

### logger to mongodb
如果没有好用的日志分析服务的话，通过日志排查问题还是比较麻烦的，akajs 提供一个简单方案，把 log 存入 mongodb 中。
1. 定义一个 LogModel
```ts
import {TypeMongoModel} from '@akajs/mongoose'
import {BaseLog} from '@akajs/web'

@TypeMongoModel('LogModel')
export class Log extends BaseLog {
}
```

2. 启用 log 记录中间件
```ts
const app: Application = new Application({
  requestLogToDB: true
})
```
该中间件默认值记录 post 类的请求，有需求的话，参考这个自己写个中间件即可。

## 健康检查
通过接口获取/修改服务状态

### 获取服务器状态
通过请求HTTP状态码判断，200:正常 503:服务状态异常
```
GET /healthcheck/check
```

### 修改服务器状
设置状态为异常
```
GET /healthcheck/status/reset?status=false
```
设置状态为正常
```
GET /healthcheck/status/reset?status=true
```

## 常用工具
@akajs/utils 收集了 Kalengo 后端开发常用的工具类，目前有
- DateUtil ：日期计算，节假日
- NumberUtil ： 主要处理 0.1 + 0.2 = 0.30000000000000004 问题
- Logger ： logger 工具，可以显示logger所在代码位置
- BizError ：自定义错误对象，有 error code

使用样例

```ts
import {logger,DateUtil} from '@akajs/utils'

logger.debug('hello', name)
// 两天后
DateUtil.getDayStart(null, 2)
```

## API 接口文档
akajs 的期望是，可以根据代码自动生成接口文档，但是这里还有些技术 block，typescript 的 ast 读取还是有些麻烦，需要些时间。

Kalengo 目前使用 api-doc ，通过注解来定义文档，但是时间长了就会缺少维护。

社区为了解决文档方便维护的问题，一般有两个思路，akajs 选择后者。

### 从文档到代码
OpenAPI 是 Swagger 参与定义的接口文档格式标准，我们可以先写好接口定义文件，然后使用代码生成工具生成对应的代码。
而且通过 Swagger 可以快速渲染接口文档，展示给你的合作方。

这个方式的缺点是你很难找到好用的代码生成器。

### 从代码到文档
这个方式的思路就是通过 compile 代码，分析 AST，生成标准的 OpenAPI file，然后就可以通过 Swagger 渲染出来了。
Java 的 Web 框架 Spring Boot 就是用这个方式。但是，Node 这边还没人去做这件事，一部分原因是 js 没有类型，不太好识别参数类型，现在有了 typescript，这个问题就比较好解决了。

## Test
akajs 默认使用 mocha 来运行测试，使用 chai 进行断言。
在示例项目中，提供了完整的单元测试实现 demo。

### 运行测试

```bash
$ npm i
$ npm run test
```

### 集成测试
akajs 默认支持集成测试，以接口为单位，当然你要写单元测试也是可以的。
测试里最麻烦的就是数据 mock，akajs 提供了一个 TestHelper 来帮你做数据准备和清理
假设我定义一个测试文件为

`user.crud.spec.ts`

只要在相同位置定义一个 fixture 文件

`user.crud.data.ts`

内容长这样：
```ts
module.exports = [
  {
    model: 'User',
    items: [
      {
        '_id': ObjectId('5b03b80c9b6c6043c138d1b6'),
        'phone': '13870399898',
        'name': 'HHHHb',
        'balance': 0,
        'isRegister': true
      }]
  }
]
```
这样才测试开始前，akajs 就会往数据库的 User 表写入一条数据，并在下一个测试开始前清理掉。

注意：这个测试方式是为了缺少简单好用事务的 mongodb 定制的。如果你使用事务型 db，不需要这么做。

### 测试辅助工具推荐

- sinon ：function mock
- nock : http mock
- timekeeper : time mock
- chai.expect : 断言

## TODO
接下来 akajs 还要集成以下常用工具
- redis/redlock
- rabbitmq
- kafka
