class AbstractFactory{

	create(ip){
		throw new Error('Abstract class needs implementation!')
	}

}

module.exports = AbstractFactory
