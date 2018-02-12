class Handler {
	construct(handler){
		this.successor = handler
	}
	handle(request){
		throw new Error('Abstract class need instantiation!!')
	}
}

module.exports = Handler