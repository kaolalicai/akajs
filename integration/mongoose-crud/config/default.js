module.exports = {
  log: {
    level: 'info',
    root: './logs',
    allLogsFileName: 'mongoose'
  },
  port: process.env.PORT || 3000,
  mongodb: {
    debug: true,
    connections: [
      {
        name: 'db-name',
        // url: process.env.MONGODB || 'mongodb://localhost/unit-test',
        url: process.env.MONGODB || 'mongodb://localhost:27017,localhost:27018,localhost:27019/test?replicaSet=rs',
        options: {}
      }
    ]
  }
}
