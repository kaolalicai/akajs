module.exports = {
  log: {
    level: 'info'
  },
  port: process.env.PORT || 3000,
  database: {
    mongoDebug: false,
    mongodb: [
      {
        name: 'db',
        url: process.env.MONGODB || 'mongodb://localhost/unit-test',
        options: {}
      }
    ]
  }
}
