const Client = require('./client')
const Server = require('./server')
const Handler = require('./handler')
const DimensionsHandler = require('./dimensions-handler')
const ToScaleHandler = require('./toscale-handler')
const ScaledHandler = require('./scaled-handler')

const ImageJS = require('imagejs')

class Supervisor{
	constructor(){
		this.server = new Server(process.argv[4], Number(process.argv[3])) // zrobic fabryke i podmienic na jej wywolanie oraz start zamienic na start bez argumentowe
		this.client = new Client(process.argv[2], Number(process.argv[3]))

		this.ips = []
		this.tasks = []
		this.ipMap = new Map() // K - ip, V - task
		this.scaledImage = null
		

		this.dimensionsHandler = new DimensionsHandler(this, null)
		this.scaledHandler = new ScaledHandler(this, this.dimensionsHandler)
		this.toScaleHandler = new toScaleHandler(this, this.scaledHandler)
		
		this.server.handlerObject = this.toScaleHandler
		this.client.handlerObject = this.toScaleHandler
		this.server.supervisorObject = this
		this.server.supervisorObject = this
		


		server.start(() => null, () => null, () => null, (c, s, data) => console.log(data))
		client.start()
	}

	updateImage(img, xs, ys){
		for(var i = 1; i <= img.width; i++){
			for(var j = 1; j <= img.height; j++){
				scaledImage.setPixel(xs+i-1, ys+j-1, img.getPixel(i,j))
			}
		}
	}

	notifyTaskDone(ip){
		this.ipMap.set(ip, this.task[0])
		this.tasks.shift()
	}

	notifyIPs(){
		var currentIPs = this.client.remoteConnectionsIP.concat(this.server.clientAdresses)
		var oldIPs = arrayDiff(this.ips, newIPs)
		var newIPs = arrayDiff(newIPs, this.ips)
		newIPs.foreach(elem => {
			if( this.ipMap.get(elem) == undefined ){
				this.ipMap.set(elem, {})
			}
		})
		oldIPs.foreach(elem =>{
			if(this.ipMap.get(elem) != {}){
				this.tasks.push(this.ipMap.get(elem))
				this.ipMap.delete(elem)
			}
		})
		this.ips = currentIPs
	}
}