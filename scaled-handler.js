const Handler = require('./handler')

const ImageJS = require('imagejs')

class ScaledHandler extends Handler{
	constructor(supervisor, handler){
		super(handler)
		this.supervisor = supervisor
	}

	handle(request){
		if(request.type = 'scaled'){
			fs.writeFile('./scaled' + request.x + '_' + request.y + '.jpg', new Buffer(request.image, 'base64'), (err)=>{})
			var bitmap = new ImageJS.Bitmap()
			bitmap.readFile('./scaled' + request.x + '_' + request.y + '.jpg')
				.then(function () {
					supervisor.updateImage(bitmap, request.x, request.y)
					fs.unlink('./scaled' + request.x + '_' + request.y + '.jpg', ()=>{})
				})
		}
		else if(successor){
			successor.handle(request)
		}
		else{
			console.log('Unhandled request')
		}
	}
}

module.exports = ScaledHandler