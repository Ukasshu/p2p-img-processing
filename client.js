const net = require('net')
const arrayDiff = require('./array-diff')
const arrayIntersection = require('./array-intersection')

class Client {
  constructor (centralIp, centralPort) {
    this.centralIp = centralIp
    this.centralPort = centralPort
    this.connections = []

    this.messageBuffers = new Map()

    this.supervisor = null
    this.handler = null
  }

  set supervisorObject(supervisor){
    this.supervisor = supervisor
  }

  set handlerObject(handler){
    this.handler = handler
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
    //socket.setTimeout(7200000) // niepotrzebne defaultowo nie ma timeoutu

    socket.connect(this.centralPort, ip, () => {
      this.connections.push(socket)
      this.messageBuffers.set(socket.remoteAddress, "")
      
      console.log('Connected to ' + ip)
      socket.write('Hello from ' + socket.localAddress)
    })

    socket.on('data', (data) => {
      console.log(data.toString())
      msg = messageBuffers.get(socket.remoteAddress) + data.toString() 
      if(msg.slice(-1) == '}'){
        messageBuffers.set(socket.remoteAddress, "")
        this.handler.handle(data.toString())  
      }
      else{
        messageBuffers.set(socket.remoteAddress, msg)
      }
      //zaimplementowac to po drugiej stronie łącznosci
    })

    socket.on('error', (error) => {
      this.connections = this.connections.filter(x => x.remoteAddress === ip)
      this.supervisor.notifyIPs()
    })

    socket.on('close', () => {
      this.connections = this.connections.filter(x => x.remoteAddress === ip)
      console.log('Client closed: ' + ip)
      this.supervisor.notifyIPs()
    })
  }

  _disconnectFromClient (ip) {
    const socket = this.connections.find(x => x.remoteAddress === ip)
    this.connections = this.connections.filter(x => x.remoteAddress === ip)
    this.supervisor.notifyIPs()
    socket.end()
  }
}

module.exports = Client
