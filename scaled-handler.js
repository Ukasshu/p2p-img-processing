const Handler = require('./handler')

const fs = require('fs')
const ImageJS = require('imagejs')

class ScaledHandler extends Handler{
	constructor(supervisor, handler){
		super(handler)
		this.supervisor = supervisor
		this.successor = handler
	}

	handle(request){
		if(request.type == 'scaled'){
			fs.writeFileSync('./scaled' + request.x + '_' + request.y + '.jpg', new Buffer(request.image, 'base64'))
			var bitmap = new ImageJS.Bitmap()
			bitmap.readFile('./scaled' + request.x + '_' + request.y + '.jpg')
				.then(function () {
					this.supervisor.updateImage(bitmap, request.x, request.y)
					fs.unlink('./scaled' + request.x + '_' + request.y + '.jpg', ()=>{})
				})
		}
		else if(this.successor){
			this.successor.handle(request)
		}
		else{
			console.log('Unhandled request')
		}
	}
}

module.exports = ScaledHandler
