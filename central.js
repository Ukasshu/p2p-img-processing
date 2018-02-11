const Server = require('./server')

class Central extends Server {
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

const central = new Central(process.argv[2], Number(process.argv[3]))
central.start()