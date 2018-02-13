const Handler = require('./handler')
const fs = require('fs')
const ImageJS = require('imagejs')

class ToScaleHandler extends Handler {
	constructor(supervisor, handler){
		super(handler)
		this.supervisor = supervisor
		this.successor = handler
	}

	handle(request){
		if(request.type == "toScale"){
			fs.writeFile('./toScale' + request.xs + '_' + request.ys + '.jpg', new Buffer(request.image, 'base64'), (err)=>{})
			var bitmap = new ImageJS.Bitmap()
			bitmap.readFile('./toScale' + request.xs + '_' + request.ys + '.jpg')
				.then( () => {
					var thumbnail = bitmap.resize({
						width: (bitmap.width*request.scale),
						height: (bitmap.height*request.scale),
						algorithm: "bicubicInterpolation"
					})
					this.supervisor.updateImage(thumbnail, (request.xs-1)*request.scale+1, (request.ys-1)*request.scale+1)
					thumbnail.writeFile('./toScale' + request.xs + '_' + request.ys + '.jpg', {quality: 90})
						.then( () => {
							var bm = fs.readFileSync('./toScale' + request.xs + '_' + request.ys + '.jpg')
							this.supervisor.broadcast(JSON.stringify({
								type: 'scaled',
								image: new Buffer(bm).toString('base64'),
								x: (request.xs-1)*request.scale+1,
								y: (request.ys-1)*request.scale+1
							}))
							fs.unlink('./toScale' + request.xs + '_' + request.ys + '.jpg', ()=>{})
						})
				})
		}
		else if(this.successor)
			this.successor.handle(request)
		else
			console.log("Unhandled request")
	}
}

module.exports = ToScaleHandler
