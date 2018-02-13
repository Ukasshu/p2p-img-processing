const Client = require('./client')
const Server = require('./server')
const Handler = require('./handler')
const DimensionsHandler = require('./dimensions-handler')
const ToScaleHandler = require('./toscale-handler')
const ScaledHandler = require('./scaled-handler')
const MyObserver =  require('./myobserver')
const ClientServerFactory = require('./clientserverfactory')
const arrayDiff = require('./array-diff')

const ImageJS = require('imagejs')
const fs = require('fs')
const opn = require('opn')

class Supervisor extends MyObserver {
	constructor(serverIP, myIP){
		super()
		this.server = new ClientServerFactory().create(myIP) // zrobic fabryke i podmienic na jej wywolanie oraz start zamienic na start bez argumentowe
		this.client = new Client(serverIP)

		this.ips = []
		this.tasks = []
		this.ipMap = new Map() // K - ip, V - task
		this.scaledImage = null
		this.isDelegatingTasks  = false


		this.dimensionsHandler = new DimensionsHandler(this, null)
		this.scaledHandler = new ScaledHandler(this, this.dimensionsHandler)
		this.toScaleHandler = new ToScaleHandler(this, this.scaledHandler)

		this.server.handlerObject = this.toScaleHandler
		this.client.handlerObject = this.toScaleHandler
		this.server.observerObject = this
		this.client.observerObject = this



		this.server.start(() => null, () => null, () => null, (c, s, data) => console.log(data))
		this.client.start()
	}

	updateImage(img, xs, ys){
		for(var i = 1; i <= img.width; i++){
			for(var j = 1; j <= img.height; j++){
				scaledImage.setPixel(xs+i-1, ys+j-1, img.getPixel(i,j))
			}
		}
		supervisor.scaledImage.writeFile('./scaledImage.jpg', {quality: 90})
				.then(() => {})
	}

	notifyTaskDone(ip){
		if(this.isDelegatingTasks){
			this.ipMap.set(ip, this.tasks[0])
			this.tasks.shift()
			var pic = fs.readFileSync('./crops/' + this.ipMap.get(ip).x + '_' + this.ipMap.get(ip).y + '.jpg')
			this.sendToIP(ip, JSON.stringify({
				type: 'toScale',
				image: new Buffer(pic).toString('base64'),//wczytać obrazek do base'a
				xs: this.ipMap.get(ip).x,
				xs: this.ipMap.get(ip).y,
				scale: 100
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
		var oldIPs = arrayDiff(this.ips, currentIPs)
		var newIPs = arrayDiff(currentIPs, this.ips)
		newIPs.forEach(elem => {
			if( this.ipMap.get(elem) == undefined ){
				this.ipMap.set(elem, {})
				if(this.isDelegatingTasks){
				    this.sendToIP(elem, JSON.stringify({
				    	type: 'dimensions',
				    	XX: scaledImage.width,
				    	YY: scaledImage.height
				    }))
				    //wyslac zadanie jesli jakies jest
				    if(this.tasks != []){
				    	task = this.tasks.shift()
				    	var pic = fs.readFileSync('./crops/' + task.x + '_' + task.y + '.jpg')
				    	this.sendToIP(elem, JSON.stringify({
				    		type: 'toScale',
				    		image: new Buffer(pic).toString('base64'),
				    		xs: task.x,
				    		ys: task.y,
				    		scale: 100
				    	}))
					}
				}
			}
		})
		oldIPs.forEach(elem =>{
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

	runCalculations(filepath){
		//funcka rozpoczynajaca całe dziadostwo xD - ta karuzele sp... xD
		var bitmap = new ImageJS.Bitmap()
		bitmap.readFile(filepath)
			.then(() => {
				this.broadcast(JSON.stringify({
					type: 'dimensions',
					XX: 100*bitmap.width,
					YY: 100*bitmap.height
				}))
				//this.scaledImage = new ImageJS.Bitmap({width: 100*bitmap.width, height: 100*bitmap.height}) //mało co zapomniałem o tym
				this.dimensionsHandler.handle({
					type: 'dimensions',
					XX: 100*bitmap.width,
					YY: 100*bitmap.height
				})

				var hAmount = 4
				var vAmount = 4
				var lastHPiece = 0
				for(var i = 0; i < hAmount; i++){
					var lastVPiece = 0
					var newHPiece = Math.floor(bitmap.width*(i+1)/hAmount)
					if( i == hAmount - 1 ){
						newHPiece = bitmap.width
					}
					for(var j = 0; j < vAmount; j++){
						var newVPiece = Math.floor(bitmap.height*(i+1)/vAmount)
						if( j =  vAmount - 1){
							newVPiece = bitmap.height
						}
						var cropped = bitmap.crop({top: lastVPiece, left: lastHPiece, width: (newHPiece-lastHPiece), height: (newVPiece-lastVPiece)})
						this.saveCrop(cropped, lastHPiece+1, lastVPiece+1) // zapisuje sie asynchronicznie
						lastVPiece = newVPiece
					}
					lastHPiece = newHPiece
				}
			})
			//this.takeAndCompleteTask() //moze nie zadzialac jesli zadne zadanie nie zostanie wstawione to tablicy
	}


	saveCrop(crop, x, y){
		crop.writeFile('./crops/' + x + '_' + y + '.jpg', {quality: 90})
			.then(()=>{
				var flag = false
				for(ipAddress in this.ips){
					if(ipMap.get(ipAddress) == {}){
						var pic = fs.readFileSync('./crops/' + x + '_' + y + '.jpg')
						this.sendToIP(ipAddress, JSON.stringify({
							type: 'toScale',
							image: new Buffer(pic).toString('base64'),
							xs: x,
							ys: y,
							scale: 100
						}))
						this.ipMap.set(ipAddress, {x: x, y: y})
						flag = true
						break
					}

				}
				if(!flag)
					this.tasks.push({x: x, y: y})
			})
	}

	runBrowserToView(){
		//potrzebny pakiet powershell do otworzenia przegladarki i http servera
		opn('./index.html')
	}

	takeAndCompleteTask(){
		if(this.tasks != []){
			var task = this.tasks.shift()
			var pic = fs.readFileSync('./crops/'+task.x+'_'+task.y+'.jpg')
			this.toScaleHandler.handle({
				type: 'toScale',
				image: new Buffer(pic).toString('base64'),
				xs: task.x,
				ys: tasks.y,
				scale: 100
			})
			this.takeAndCompleteTask()
		}

	}
}

module.exports = Supervisor
