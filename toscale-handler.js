const Handler = require('./handler')
const fs = require('fs')
const ImageJS = require('imagejs')

class ToScaleHandler extends Handler {
	constructor(supervisor, handler){
		super(handler)
		this.supervisor = supervisor
	}

	handle(request){
		if(request.type == 'toScale'){
			fs.writeFile('./toScale' + request.xs + '_' + request.ys + '.jpg', new Buffer(request.image, 'base64'), (err)=>{})
			var bitmap = new ImageJS.Bitmap()
			bitmap.readFile('./toScale' + request.xs + '_' + request.ys + '.jpg')
				.then(function () {
					var thumbnail = bitmap.resize({
						width: (bitmap.width*request.scale),
						height: (bitmap.height*request.scale),
						algorithm: "bicubicInterpolation"
					})
					supervisor.updateImage(thumbnail, (request.xs-1)*request.scale+1, (request.ys-1)*request.scale+1)
					thumbnail.writeFile('./toScale' + request.xs + '_' + request.ys + '.jpg', {quality: 90})
						.then(function() {
							var bm = fs.readFileSync('./toScale' + request.xs + '_' + request.ys + '.jpg')
							supervisor.broadcast(JSON.stringify({
								type: 'scaled',
								image: new Buffer(bm).toString('base64'),
								x: (request.xs-1)*request.scale+1,
								y: (request.ys-1)*request.scale+1
							}))
							fs.unlink('./toScale' + request.xs + '_' + request.ys + '.jpg', ()=>{})
						})
				})
		}
		else if(successor)
			successor.handle(request)
		else
			console.log("Unhandled request")
	}
}

module.exports = ToScaleHandler
