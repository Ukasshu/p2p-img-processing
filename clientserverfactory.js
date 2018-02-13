const AbstractFactory = require('./abstractfactory')

class ClientServerFactory extends AbstractFactory {

	create(ip){
		return new ClientServerFactory(ip, 2137)
	}

}