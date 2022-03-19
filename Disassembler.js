
// const INSTRUCTION_SET = require("./INSTRUCTION_SET")
let Disassembler
import INSTRUCTION_SET from "./INSTRUCTION_SET.js"
export default Disassembler={
    disassemble(opcode){
        const instructions = INSTRUCTION_SET.find(
            (instruction) => (opcode & instruction.mask)===instruction.pattern
            )
    //  console.log(opcode,instructions)
        const args = instructions.arguments.map(arg=>(opcode & arg.mask)>>arg.shift)
        return {instructions, args}
    }
}

// module.exports = Disassembler  