class AbstractFactory{

	create(ip){
		throw new Error('Abstract class need instantiation!!')
	}

}

module.exports = AbstractFactory