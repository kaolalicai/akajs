
[使用指南](https://kaolalicai.github.io/akajs_doc/)

# 关于 akajs
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

# QuickStart

我们提供了一个脚手架模板，使用 klg-init 工具来初始化项目，如果没有 klg-init, 请先安装

```bash
npm i klg-init -g
```

创建项目

```bash
$ mkdir aka-example && cd aka-example
$ klg-init . --type=project-ts
$ npm i
```

启动项目:

```bash
$ npm run dev
$ open http://localhost:3000
```

