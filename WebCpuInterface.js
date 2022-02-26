// const cpuInterface = require("./cpuInterface")
// const {DISPLAY_HEIGHT, DISPLAY_WIDTH, COLOR} = require("./Constants")
// const keyMap = require("./KeyMap")
import cpuInterface from"./cpuInterface.js"
import Constants from "./Constants.js"
import keyMap from "./KeyMap.js"
export default class WebCpuInterface extends cpuInterface{
    constructor (){
        super()

        //screen
        this.frameBuffer = this._createFrameBuffer()
        this.screen = document.querySelector("canvas")
        this.multiplier = 10
        this.screen.width = Constants.DISPLAY_WIDTH * this.multiplier
        this.screen.height = Constants.DISPLAY_HEIGHT*this.multiplier
        this.context = this.screen.getContext("2d")
        this.context.fillStyle = 'black'
        this.context.fillRect(0,0, this.screen.width, this.screen.height)

        //keys
        this.keys = 0
        this.keyPressed = undefined

        //sound
        this.soundEnabled = false

        if("AudioContext" in window||"webkitAudioContext" in window){
            this.audioContext = new (AudioContext || webkitAudioContext)()

            this.masterGain = new GainNode(this.audioContext)
            this.masterGain.gain.value = 0.3
            this.masterGain.connect(this.audioContext.destination)

            let soundEnabled = false
            let oscillator
            Object.defineProperties(this,{
                soundEnabled:{
                    get: function(){return soundEnabled},
                    set:function(value){
                        value = Boolean(value)
                        if(value !== soundEnabled){
                            soundEnabled = value
                            if(soundEnabled){
                                oscillator = new OscillatorNode(this.audioContext, {
                                    type:"square"
                                })
                                oscillator.connect(this.masterGain)
                                oscillator.start()

                            }else{

                                oscillator.stop()
                            }
                        }
                    }
                }
            })
            //interface for muting sound 
            const muteInstrutictions = document.createElement("pre")
            muteInstrutictions.classList.add("instruction")
            muteInstrutictions.innerText = "M = toggle sound"
            const muteIcon = document.createElement("span")
            muteIcon.innerText = "🔊"
            muteInstrutictions.append(muteIcon)
            //  document.querySelector(".intructions").insertAdjacentElement("afterend", muteInstrutictions)
            


            let muted = false
            document.addEventListener("keydown", event=>{
                if(event.key.toLocaleLowerCase() ==="m"){
                    muted = !muted
                    muteIcon.innerText = muted ? '🔇' : '🔊'
                    this.masterGain.gain.value = muted? 0: 0.3

                }
            })
        }
        // key down event
        document.addEventListener("keydown",event=>{
            const keyIndex = keyMap.indexOf(event.key)
            if(keyIndex > -1){
                this._setKeys(keyIndex)
            }
        })
        // key up event
        document.addEventListener("keyup", event=>{
            this._resetKeys()
        })
    }
    _createFrameBuffer(){
        let frameBuffer =[]
        for(let i=0; i<Constants.DISPLAY_WIDTH; i++){
            frameBuffer.push([])
            for(let j=0; j<Constants.DISPLAY_HEIGHT; j++){
                frameBuffer[i].push(0)
            }
        }

        return frameBuffer
    }
    _setKeys(keyIndex){
        let keyMask = 1<<keyIndex
        this.keys = this.keys| keyMask
        this.keyPressed = keyIndex
    }
    _resetKeys(){
        this.keys = 0
        this.keyPressed = undefined
    }
    waitKey(){
        const keyPressed = this.keyPressed
        this.keyPressed = undefined
        return keyPressed
    }
    getKeys(){
        return this.keys
    }
    drawPixel(x,y,value){
        const colision = this.frameBuffer[y][x]&value
        this.frameBuffer[y][x] ^= value

        
        if(this.frameBuffer[y][x]){
            console.log(this.frameBuffer, colision)
            this.context.fillStyle = Constants.COLOR
            this.context.fillRect(
                x*this.multiplier,
                y*this.multiplier,
                this.multiplier,
                this.multiplier
            )
        }else{
            this.context.fillStyle = 'black'
            this.context.fillRect(
                x*this.multiplier,
                y*this.multiplier,
                this.multiplier,
                this.multiplier
            )
        }
        return colision
    }
    clearDisplay(){
        this.frameBuffer = this._createFrameBuffer()
        this.context.fillStyle = 'black'
        this.context.fillRect(0,0,this.screen.width, this.screen.height)
    }
    enableSound(){
        this.soundEnabled = true
    }
    disableSound(){
        this.soundEnabled = false
    }
}
// module.exports={
//     WebCpuInterface
// }