export default class cpuInterface{

    constructor(){
        if(new.target === cpuInterface){
            throw new TypeError("cannot instantiate abstract class")
        }

    }
    clearDisplay(){
        throw new TypeError('Must be implemented on the inherited class.')
    }
    waitKey(){
        throw new TypeError('Must be implemented on the inherited class.')
    }
    getKeys(){
        throw new TypeError('Must be implemented on the inherited class.')
    }
    drawPixel(){
        throw new TypeError('Must be implemented on the inherited class.')
    }
    enableSound(){
        throw new TypeError('Must be implemented on the inherited class.')
    }
    disableSound(){
        throw new TypeError('Must be implemented on the inherited class.')
    }
}
// module.exports = cpuInterface