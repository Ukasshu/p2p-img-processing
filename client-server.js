const Server = require('./server')
const MyObserver = require('./myobserver')

const net = require('net')

class ClientServer extends Server {
	constructor(address, port){
		super(address, port)

		this.observer = null
		this.handler = null

		this.messageBuffers = new Map()
	}

	set observerObject(observer){
		this.observer = observer
	}

	set handlerObject(handler){
		this.handler = handler
	}

	start() {
    const connection = net.createServer((socket) => {
      let client = socket
      let clientAddress = socket.remoteAddress
      console.log(`${clientAddress} connected.`)

      this.messageBuffers.set(socket.remoteAddress, "")

      this.clients.push(socket)
			this.observer.notifyIPs()

      socket.on('data', (data) => {
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

      socket.on('end', () => {
        this.clients = this.clients.filter(x => x.remoteAddress !== clientAddress)
        this.observer.notifyIPs()
        console.log(`${clientAddress} disconnected.`)
      })

      socket.on('error', (error) => {
        this.clients = this.clients.filter(x => x.remoteAddress !== clientAddress)
        this.observer.notifyIPs()
      })

      socket.on('close', () => {
        this.clients = this.clients.filter(x => x.remoteAddress !== clientAddress)
        console.log('Closed: ' + clientAddress)
        this.observer.notifyIPs()
      })
    })

    	connection.listen(this.port, this.address)
  	}


  	sendToIP(ip, msg){
  		for(var i in this.clients){
  			if(this.clients[i].remoteAddress == ip){
  				this.clients[i].write(msg)
  				break
  			}
  		}
  	}
}

module.exports = ClientServer
