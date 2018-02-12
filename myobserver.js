class MyObserver {
	notifyIPs(){
		throw new Error("Tried to use abstract class")
	}

	notifyTaskDone(ip){
		throw new Error("Tried to use abstract class")
	}
}

module.exports = MyObserver