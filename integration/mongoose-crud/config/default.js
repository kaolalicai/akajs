module.exports = {
  log: {
    level: 'info'
  },
  port: process.env.PORT || 3000,
  mongodb: {
    debug: false,
    connections: [
      {
        name: 'db',
        url: process.env.MONGODB || 'mongodb://localhost/unit-test',
        options: {}
      }
    ]
  }
}
