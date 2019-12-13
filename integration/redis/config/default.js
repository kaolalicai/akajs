module.exports = {
  log: {
    level: 'debug'
  },
  database:{
    redis:{
      host: '127.0.0.1',
      port: 6379
    }
  },
  port: process.env.PORT || 3000
}
