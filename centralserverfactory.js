const AbstractFactory = require('./abstractfactory')


class CentralServerFactory extends AbstractFactory{

	create(ip){
		return new CentralServer(ip, 2137)
	}

}

module.exports = CentralServerFactory