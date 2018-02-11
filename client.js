const net = require('net')
const arrayDiff = require('./array-diff')
const arrayIntersection = require('./array-intersection')

class Client {
  constructor (centralIp, centralPort) {
    this.centralIp = centralIp
    this.centralPort = centralPort
    this.connections = []
  }

  get remoteConnectionsIP () {
    return this.connections.map(x => x.remoteAddress)
  }

  start () {
    const centralConnection = new net.Socket()
    centralConnection.connect(this.centralPort, this.centralIp)

    centralConnection.on('data', (data) => {
      const ipsFromServer = JSON.parse(data)
      const ipsFromServerWithoutMine =
        ipsFromServer.filter(x => x !== centralConnection.localAddress)
      const arrIntersection = arrayIntersection(this.remoteConnectionsIP, ipsFromServerWithoutMine)
      const toConnect = arrayDiff(ipsFromServerWithoutMine, arrIntersection)
      const toDisconnect = arrayDiff(this.remoteConnectionsIP, arrIntersection)

      console.log('connections', this.remoteConnectionsIP)
      console.log('ipsFromServer', ipsFromServer)
      console.log('toConnect', toConnect)
      console.log('toDisconnect', toDisconnect)

      toConnect.forEach(x => this._connectToClient(x))
      toDisconnect.forEach(x => this._disconnectFromClient(x))
    })
  }

  _connectToClient (ip) {
    const socket = new net.Socket()
    socket.setTimeout(7200000)

    socket.connect(this.centralPort, ip, () => {
      this.connections.push(socket)
      console.log('Connected to ' + ip)
      socket.write('Hello from ' + socket.localAddress)
    })

    socket.on('data', (data) => {
      console.log(data.toString())
    })

    socket.on('error', (error) => {
      this.connections = this.connections.filter(x => x.remoteAddress === ip)
    })

    socket.on('close', () => {
      this.connections = this.connections.filter(x => x.remoteAddress === ip)
      console.log('Client closed: ' + ip)
    })
  }

  _disconnectFromClient (ip) {
    const socket = this.connections.find(x => x.remoteAddress === ip)
    this.connections = this.connections.filter(x => x.remoteAddress === ip)
    socket.end()
  }
}

module.exports = Client
