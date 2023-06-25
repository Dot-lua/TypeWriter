module.exports = function () {

    globalThis.SleepSync = async function (Time) {
        Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, Time)
    }
    
    globalThis.WaitSync = async function (Time) { //in seconds
        Sleep(Time * 1000)
    }

    globalThis.Sleep = function (Time) {
        return new Promise((resolve) => setTimeout(resolve, Time))
    }

    globalThis.Wait = function (Time) { //in seconds
        return Sleep(Time * 1000)
    }

}