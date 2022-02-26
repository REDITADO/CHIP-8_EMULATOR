 import CPU from "./Chip-8.js"
import RomBuffer from "./RoomBuffer.js"
import  WebCpuInterface  from "./WebCpuInterface.js"

const cpuInterface = new WebCpuInterface()
const cpu = new CPU(cpuInterface)
let constructors
export default constructors ={
    cpu,RomBuffer
}
