const Supervisor = require('./supervisor')

const supervisor = new Supervisor()

setTimeout( ()=> {supervisor.runCalculations('./image.jpg')}, 15000)