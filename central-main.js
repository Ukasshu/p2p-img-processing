const CentralServerFactory = require('./centralserverfactory')

const server = new CentralServerFactory().create(process.argv[2])

server.start()
