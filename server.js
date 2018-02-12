const net = require('net')
//const MyObserver = require('./myobserver') do servera clientowego doniesc

class Server {
  constructor (address, port) {
    this.address = address || '127.0.0.1'
    this.port = port
    this.clients = []
  }

  get clientAddresses() {
    return this.clients.map(x => x.remoteAddress)
  }

  get clientAddressesJSON() {
    return JSON.stringify(this.clientAddresses)
  }

  start (connectFn, disconnectFn, errorFn, dataFn) {
    const connection = net.createServer((socket) => {
      let client = socket
      let clientAddress = socket.remoteAddress
      console.log(`${clientAddress} connected.`)

      this.clients.push(socket)

      connectFn(client, this)

      socket.on('data', (data) => {
        dataFn(client, this, data.toString())
      })

      socket.on('end', () => {
        this.clients = this.clients.filter(x => x.remoteAddress !== clientAddress)
        disconnectFn(client, this)
        console.log(`${clientAddress} disconnected.`)
      })

      socket.on('error', (error) => {
        this.clients = this.clients.filter(x => x.remoteAddress !== clientAddress)
        errorFn(client, this)
      })

      socket.on('close', () => {
        this.clients = this.clients.filter(x => x.remoteAddress !== clientAddress)
        console.log('Closed: ' + clientAddress)
      })
    })

    connection.listen(this.port, this.address)
  }

  broadcast (message, clientSender) {
    this.clients.forEach(client => {
      client.write(message)
    })
  }
}

module.exports = Server