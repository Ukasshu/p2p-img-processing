const Server = require('./server')

class CentralServer extends Server {
  start () {
    super.start(this._broadcastLimited.bind(this),
      this._broadcastLimited.bind(this),
      this._broadcastLimited.bind(this),
      () => null)
  }

  _broadcastLimited () {
    this.clients.forEach((x, i) =>
      x.write(
        JSON.stringify(this.clientAddresses.slice(i + 1))
      )
    )
  }
}
