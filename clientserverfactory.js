const AbstractFactory = require('./abstractfactory')
const ClientServer = require('./client-server')

class ClientServerFactory extends AbstractFactory {

	create(ip){
		return new ClientServer(ip, 2137)
	}

}

module.exports = ClientServerFactory