const Handler = require('./handler')

const ImageJS = require('imagejs')

class DimensionsHandler extends Handler{
	constructor(supervisor, handler){
		super(handler)
		this.supervisor = supervisor
		this.successor = handler
	}

	handle(request){
		console.log(request.type)
		if(request.type == 'dimensions'){
			this.supervisor.scaledImage = new ImageJS.Bitmap({width: request.XX, height: request.YY})
			this.supervisor.scaledImage.writeFile('./scaledImage.jpg', {quality: 90})
				.then(() => {})
			this.supervisor.runBrowserToView()
		}
		else if (this.successor)
			this.successor.handle(request)
		else
			console.log('Unhandled request')
	}
}

module.exports = DimensionsHandler
