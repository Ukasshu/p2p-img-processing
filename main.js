const Client = require('./client')
const Server = require('./server')

const server = new Server(process.argv[4], Number(process.argv[3]))
server.start(() => null, () => null, () => null, (c, s, data) => console.log(data))

const client = new Client(process.argv[2], Number(process.argv[3]))
client.start()