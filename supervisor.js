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
		this.server = new ClientServerFactory().create(myIP)
		this.client = new Client(serverIP)

		this.ips = []
		this.tasks = []
		this.ipMap = new Map()
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
				this.scaledImage.setPixel(xs+i-1, ys+j-1, img.getPixel(i,j))
			}
		}
		this.scaledImage.writeFile('./tmpImage.jpg', {quality: 90})
				.then(() => {
					fs.unlinkSync('./scaledImage.jpg')
					fs.renameSync('./tmpImage.jpg', './scaledImage.jpg')
				})
	}

	notifyTaskDone(ip){
		if(this.isDelegatingTasks){
			if(this.tasks.length != 0){
				this.ipMap.set(ip, this.tasks[0])
				this.tasks.shift()
				var pic = fs.readFileSync('./crops/' + this.ipMap.get(ip).x + '_' + this.ipMap.get(ip).y + '.jpg')
				this.sendToIP(ip, JSON.stringify({
					type: 'toScale',
					image: new Buffer(pic).toString('base64'),
					xs: this.ipMap.get(ip).x,
					ys: this.ipMap.get(ip).y,
					scale: 100
				}))
			}
		}
		else{
			null
		}
	}

	notifyIPs(){
		console.log('IPS')
		var currentIPs = this.client.remoteConnectionsIP.concat(this.server.clientAddresses)
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
				    if(this.tasks.length != 0){
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
			if(!this.ipMap.get(elem).hasOwnProperty('x')){
				this.tasks.push(this.ipMap.get(elem))
				this.ipMap.delete(elem)
			}
		})
		this.ips = currentIPs
		console.log(this.ips)
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
		var bitmap = new ImageJS.Bitmap()
		bitmap.readFile(filepath)
			.then(() => {
				this.broadcast(JSON.stringify({
					type: 'dimensions',
					XX: 100*bitmap.width,
					YY: 100*bitmap.height
				}))
				this.dimensionsHandler.handle({
					type: 'dimensions',
					XX: 100*bitmap.width,
					YY: 100*bitmap.height
				})

				var hAmount = 8
				var vAmount = 8
				var lastHPiece = 0
				for(var i = 0; i < hAmount; i++){
					var lastVPiece = 0
					var newHPiece = Math.floor(bitmap.width*(i+1)/hAmount)
					if( i == hAmount - 1 ){
						newHPiece = bitmap.width
					}
					for(var j = 0; j < vAmount; j++){
						var newVPiece = Math.floor(bitmap.height*(j+1)/vAmount)
						if( j ==  vAmount - 1){
							newVPiece = bitmap.height
						}
						console.log(lastVPiece +' '+ newVPiece +' '+ lastHPiece +' '+ newHPiece +' '+ i +' '+ j)
						var cropped = bitmap.crop({top: lastVPiece, left: lastHPiece, width: (newHPiece-lastHPiece), height: (newVPiece-lastVPiece)})
						this.saveCrop(cropped, lastHPiece+1, lastVPiece+1)
						lastVPiece = newVPiece
					}

					lastHPiece = newHPiece
				}
			})
			this.isDelegatingTasks = true
	}


	saveCrop(crop, x, y){
		crop.writeFile('./crops/' + x + '_' + y + '.jpg', {quality: 90})
			.then(()=>{
				/*var flag = false         //doesn't work
				for(var ipAddress in this.ips){
					if(this.ipMap.get(ipAddress) == {}){
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
				}*/
			})
			this.tasks.push({x: x, y: y})
			setTimeout(()=>{this.giveAwayTasks()}, 7000)
	}

	//powershell package is required to run http-server and the browser
	runBrowserToView(){
		opn('./index.html')
	}

	giveAwayTasks(){
		console.log('gat')
		for(var i in this.ips){
			if(! this.ipMap.get(this.ips[i]).hasOwnProperty('x')){
				var task = this.tasks.shift()
				var pic = fs.readFileSync('./crops/' + task.x + '_' + task.y + '.jpg')
				this.sendToIP(this.ips[i], JSON.stringify({
					type: 'toScale',
					image: new Buffer(pic).toString('base64'),
					xs: task.x,
					ys: task.y,
					scale: 100
				}))
				this.ipMap.set(this.ips[i], task)
			}
		}
	}

	/*this method was expected to do tasks by the peer which divides the tasks
	 but 'something is no yes' */

	/*takeAndCompleteTask(){
		if(this.tasks.length !== 0){
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
	} */

}

module.exports = Supervisor
