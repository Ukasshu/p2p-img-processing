class Handler {

	construct(handler){
		this.successor = handler
	}

	handle(request){
		throw new Error('Abstract class needs implementation!')
	}

}

module.exports = Handler
