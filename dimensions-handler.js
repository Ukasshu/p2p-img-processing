const Handler = require('./handler')

const ImageJS = require('imagejs')

class DimensionsHandler extends Handler{
	constructor(supervisor, handler){
		super(handler)
		this.supervisor = supervisor
	}

	handle(request){
		if(request.type == 'dimensions'){
			this.supervisor.scaledImage = new ImageJS.Bitmap({width: request.XX, height: request.YY})
			this.supervisor.scaledImage.writeFile('./scaledImage.jpg', {quality: 90})
				.then(() => {})
		}
		else if (successor)
			this.successor.handle(request)
		else
			console.log('Unhandled request')
	}
}

module.exports = DimensionsHandler
