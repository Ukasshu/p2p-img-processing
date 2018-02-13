const Server = require('./server')

const net = require('net')

class CentralServer extends Server {
  start () {
    super.start(this._broadcastLimited.bind(this),
      this._broadcastLimited.bind(this),
      this._broadcastLimited.bind(this),
      () => null)
  }

  /*start (connectFn, disconnectFn, errorFn, dataFn) {
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
  }*/



  _broadcastLimited () {
    this.clients.forEach((x, i) =>
      x.write(
        JSON.stringify(this.clientAddresses.slice(i + 1))
      )
    )
  }
}

module.exports = CentralServer