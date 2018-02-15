const AbstractFactory = require('./abstractfactory')
const CentralServer = require('./central-server')


class CentralServerFactory extends AbstractFactory{

	create(ip){
		return new CentralServer(ip, 2137)
	}

}

module.exports = CentralServerFactory
