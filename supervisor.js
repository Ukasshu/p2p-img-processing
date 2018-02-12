const Client = require('./client')
const Server = require('./server')
const Handler = require('./handler')
const DimensionsHandler = require('./dimensions-handler')
const ToScaleHandler = require('./toscale-handler')
const ScaledHandler = require('./scaled-handler')
const MyObserver =  require('./mysobserver')

const ImageJS = require('imagejs')

class Supervisor extends MyObserver {
	constructor(){
		this.server = new Server(process.argv[4], Number(process.argv[3])) // zrobic fabryke i podmienic na jej wywolanie oraz start zamienic na start bez argumentowe
		this.client = new Client(process.argv[2], Number(process.argv[3]))

		this.ips = []
		this.tasks = []
		this.ipMap = new Map() // K - ip, V - task
		this.scaledImage = null
		this.isDelegatingTasks  = false
		

		this.dimensionsHandler = new DimensionsHandler(this, null)
		this.scaledHandler = new ScaledHandler(this, this.dimensionsHandler)
		this.toScaleHandler = new toScaleHandler(this, this.scaledHandler)
		
		this.server.handlerObject = this.toScaleHandler
		this.client.handlerObject = this.toScaleHandler
		this.server.observerObject = this
		this.server.observerObject = this
		


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
		if(this.isDelegatingTasks){
			this.ipMap.set(ip, this.tasks[0])
			this.tasks.shift()
			this.sendToIP(ip, JSON.stringify({
				type: 'toScale',
				image: 'tmp'//wczytać obrazek do base'a
				xs: this.ipMap.get(ip).x,
				xs: this.ipMap.get(ip).y,
				scale: 1000
			}))
		}
		else{
			//something is no yes
			// albo tak ma być i będzie bo serwer is client nie bedzie wiedział o tym czy dane zadanie zostało zlecone przez danego supervisora
			null
		}
		//trzeba dopisac wysylanie wiadomosci do socketu o podanym adresie ze ma cos robic
		//potrzeba flagi ktora bedzie oznaczac supervisor'a ktory nadzoruje przetwarzanie aby nie wyslac od wszystkich klientow 
		//wymiarów obrazka aby client nie sfixował
	}

	notifyIPs(){
		var currentIPs = this.client.remoteConnectionsIP.concat(this.server.clientAdresses)
		var oldIPs = arrayDiff(this.ips, newIPs)
		var newIPs = arrayDiff(newIPs, this.ips)
		newIPs.foreach(elem => {
			if( this.ipMap.get(elem) == undefined ){
				this.ipMap.set(elem, {})
				if(this.isDelegatingTasks){
				    this.sendToIP(elem, JSON.stringify({
				    	type: 'dimensions',
				    	XX: scaledImage.width,
				    	YY: scaledImage.height
				    }))
				}
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

	sendToIP(ip, msg){
		this.client.sendToIP(ip, msg)
		this.server.sendToIP(ip, msg)
	}

	broadcast(msg){
		this.client.broadcast(msg)
		this.server.broadcast(msg)
	}

	runCalculations(){
		//funcka rozpoczynajaca całe dziadostwo xD - ta karuzele sp... xD
	}
}