const Supervisor = require('./supervisor')

const supervisor = new Supervisor(process.argv[2], process.argv[3])

setTimeout( ()=> {supervisor.runCalculations('./image.jpg')}, 5000)
