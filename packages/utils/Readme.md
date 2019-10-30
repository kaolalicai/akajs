# akajs
akajs 并不是一个Web框架，它是 Kalengo 的一堆 Node.js 的后端开发实践，其目的是把这些开发实践变成一个包，方便开发快速搭建一个后端服务。

akajs 是为 Kalengo 定制的。

比如 akajs 是基于 koa 做包装而不是 express，原因是因为我们对 Koa 更熟悉

又比如 akajs 暂时只支持 mongodb，因为我们公司业务 mongodb 就足够支撑了。

akajs 并不适合所有项目，但是它可以给你一个参考
- 如何包装 mongoose
- 如何校验参数和处理全局异常
- 如何集成 IOC
- 如何做集成测试
等等

akajs 会参考 NestJs 和 Egg.js 两个框架的设计

## QuickStart

可以直接使用我们的 klg-init 工具来初始化项目，如果没有 klg-init, 请先安装

`npm i klg-init -g`

创建项目

`klg-init <dir>`

选择"Typescript 后端项目模板"即可

## 模块化
在项目变复杂的时候，进行模块划分降低复杂度的有效方法。
在之前一些项目中，我通过文件夹隔离的方式来实现模块化
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

而 NestJs 则提供了 Module 的注解，来强制定义模块，也是不错的方法。

**不过在云原生时代，有了 k8s 的辅助，最好还是不要做模块化了，拆成多个服务吧，服务足够小的情况下，分工和技术升级会简单很多**

## 注解式路由

使用注解声明路由
中间件的支持后面会加上

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

## IOC 依赖注入
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
也就是说，这段代码包含了业务逻辑和组件之间的引用关系两种内容。当代码量上去之后，关系和业务逻辑交织在一起，后面要改动其中某个关系就要打动干戈了，你可能要修改多处代码，还可能改错和改漏。

IOC 的目的就是把组件关系从代码里抽出来，由配置文件来定义，修改引用关系直接通过修改配置文件即可实现。

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
code = 1 代表发生了错误，当然你也可以定义自己的一套 code，@akajs/utils 提供了 AppError 自定义错误对象。

## Mongoose 支持

通过 MongoModel 注解定义 mongoose 对象

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

@MongoModel(Symbol.for('UserModel'))
export class User implements IBaseMongoModel {
  modelName = 'User'
  schema = schema
}

```

程序初始化的时候会初始化 mongoose 连接并注入 model 到容器中。

此外，你还可以定义 UserModel 的类型，这样 typescript 才可以帮你做类型校验和代码提示。

> 当然，这些写法的坏处是每个属性都要在 Schema 和 Interface 定义，有点写两遍代码的意思。
> 所以社区有一个库 [typegoose](https://github.com/szokodiakos/typegoose), 直接把 Class 和 Schema 合二为一。
> 目前我个人不推荐使用这个库，还不太成熟，为了少写一部分代码，你需要学习新的写法+承受未知的BUG。


定义好了 Model，就可以在 Controller 里使用了。

```ts
@CrudController('/user')
export class UserController {

  @inject(TYPES.UserModel)
  private crudModel: UserModel

  async hello(){
    const user = await this.crudModel.findOne({})
  }
}
```

**注意**：这里实际注入的并不是 User 这个Class的实例，而是 mongoose 注册的 model。

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

查询接口支持分页，详细见测试 integration/mongoose-crud/e2e/user.page.spec.ts

## 常用工具
@akajs/utils 收集了 Kalengo 后端开发常用的工具类，目前有
- DateUtil ：日期计算，节假日
- NumUtil ： 主要处理 0.1 + 0.2 = 0.30000000000000004 问题
- Logger ： logger 工具，包含logger代码位置
- AppError ：自定义错误对象，有 error code

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

运行测试

```bash
$ npm i
$ npm run test
```
akajs 默认支持集成测试，以接口为单位，当然你要写单元测试也是可以的。
测试里最麻烦的就是数据 mock，akajs 提供了一个 TestHelper 来帮你做数据准备和清理
假设我定义一个测试文件为

`user.crud.spec.ts`

只要在相同位置定义一个 fixture 文件

`user.crud.data.ts`

内容大概这样：
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

### 测试辅助工具

- sinon ：function mock
- nock : http mock
- timekeeper : time mock
- chai.expect : 断言

## TODO
接下来 akajs 还要集成以下常用工具
- redis/redlock
- rabbitmq
- kafka
