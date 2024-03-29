const net = require('net')
const arrayDiff = require('./array-diff')
const arrayIntersection = require('./array-intersection')
const MyObserver = require('./myobserver')

class Client {
    constructor (centralIp) {
        this.centralIp = centralIp
        this.centralPort = 2137
        this.connections = []

        this.messageBuffers = new Map()

        this.observer = null
        this.handler = null
  }

    set observerObject(observer){
        this.observer = observer
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

        socket.connect(this.centralPort, ip, () => {
            this.connections.push(socket)
            this.messageBuffers.set(socket.remoteAddress, "")
            this.observer.notifyIPs()
            console.log('Connected to ' + ip)
        })

        socket.on('data', (data) => {
            console.log(data.toString())
            var msg = this.messageBuffers.get(socket.remoteAddress) + data.toString()
            if(msg.slice(-1) == '}'){
                this.messageBuffers.set(socket.remoteAddress, "")
                var msgObj = JSON.parse(msg)
                msgObj.ip = socket.remoteAddress
                this.handler.handle(msgObj)
            }
            else{
                this.messageBuffers.set(socket.remoteAddress, msg)
            }
        })

        socket.on('error', (error) => {
            this.connections = this.connections.filter(x => x.remoteAddress === ip)
            this.observer.notifyIPs()
        })

        socket.on('close', () => {
            this.connections = this.connections.filter(x => x.remoteAddress === ip)
            console.log('Client closed: ' + ip)
            this.observer.notifyIPs()
        })
    }

    _disconnectFromClient (ip) {
        const socket = this.connections.find(x => x.remoteAddress === ip)
        this.connections = this.connections.filter(x => x.remoteAddress === ip)
        this.observer.notifyIPs()
        socket.end()
    }

    sendToIP(ip, msg){
        for(var i in this.connections){
            if ( this.connections[i].remoteAddress == ip ){
                this.connections[i].write(msg)
                break
            }
        }
    }

    broadcast(msg){
        this.connections.forEach( socket => {
            socket.write(msg)
        })
    }

}

module.exports = Client
