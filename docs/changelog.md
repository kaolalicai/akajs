## 0.5.0
- feat: @akajs/core 拆分为 @akajs/ioc 和 @akajs/web
- feat: @akajs/crud 并入 @akajs/web
- feat: 支持 logger to db
- feat: 新增 @Autowired 注解，简化注入方式

## 0.4.5
- feat: logger 添加 LoggerFactory 支持自定义
- feat: logger 支持把O bject 和错误对象输出为一行，方便 Log工具处理
- feat: logger 支持写入文件和按日分割
- feat: request log 使用更加简单的格式
- feat: @Service 默认为单例
- fix: mongoModel 的 modelName 没生效
---
## 0.4.0
- akajs/mongoose 支持 typegoose
- akajs/mongoose 的 getModel 方法返回类型
- fix CrudController 注解支持中间件
- 优化 BizError 自定义 Error 对象的实现
---
## 0.3.0
- 自动加载 model 和 controller 并新增文档描述
- 文档使用 vuepress 重新编写
---
## 0.2.0
- CRUD 接口支持更丰富的查询参数
- 新增健康检查接口 by herwin
---
## 0.1.0
- 可用版本
