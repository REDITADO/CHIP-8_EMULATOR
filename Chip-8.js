// const FONT_SET = require("./fontSet")
// const Disassembler = require('./Disassembler')
// const { DISPLAY_HEIGHT, DISPLAY_WIDTH } = require('./constants')
import FONT_SET from "./fontSet.js"
import Disassembler from "./Disassembler.js"
import Constants from"./Constants.js"

export default class CPU{
  /**
       * @param { CpuInterface } cpuInterface I/O for Chip8
       */
    constructor(cpuInterface){
        this.interface =   cpuInterface
        
        this.reset()
    }
    reset(){
        this.memory = new Uint8Array(5096)
        this.stack = new Uint16Array(16)
        this.registers = new Uint8Array(16)
        this.I = 0
        this.SP = -1
        this.DT = 0
        this.ST = 0
        this.PC = 0x200
        this.healted= true
        this.soundEnable= true
    }
    load(roomBuffer){
        this.reset()
        for(let i = 0; i<FONT_SET.length;i++){
            this.memory[i] = FONT_SET[i]
        }

        const roomData = roomBuffer.data
        const memoryStart = 0x200;
        this.healted= false

        for(let i=0;i<roomData.length;i++){
            this.memory[memoryStart+2*i] = roomData[i] >>8
            this.memory[memoryStart+2*i+1] = roomData[i] & 0x00ff
             
        }
      
    }

    tick(){
        if(this.DT > 0){
            this.DT-=4
        }
        if(this.ST >0){
            this.ST--
        }else{
            if(this.soundEnable){
                this.interface.disableSound()
                this.soundEnable = false
            }
        }
    }
    halt(){
        this.healted = true
    }
    step(){
        if(this.healted){
            throw new Error(
                'A problem has been detected and Chip-8 has been shut down to prevent damage to your computer.'
            )
        }
        const opcode = this._fetch()
        const instruction = this._decode(opcode)
        
        this._execute(instruction)
    }
    _nextInstruction(){
        this.PC = this.PC+2
    }
    _skipInstruction(){
        this.PC+=4
    }
    _fetch(){
        if(this.PC>4096){
            this.healted = true
            throw new Error("Memory out od bounds")
        }
        console.log(this.memory[this.PC], (this.memory[this.PC] <<8)+'weee')
        return (this.memory[this.PC] <<8)| (this.memory[this.PC+1]<<0)
    }
    _decode(opcode){
      
        return Disassembler.disassemble(opcode)
    }
    _execute(instruction){
         const id = instruction.instructions.id
        const args = instruction.args
      
        switch(id){
          case 'CLS':
            // 00E0 - Clear the display
            this.interface.clearDisplay()
            this._nextInstruction()
            break
    
          case 'RET':
            // 00EE - Return from a subroutine
            if (this.SP === -1) {
              this.halted = true
              throw new Error('Stack underflow.')
            }
    
            this.PC = this.stack[this.SP]
            this.SP--
            break
    
          case 'JP_ADDR':
            // 1nnn - Jump to location nnn
            this.PC = args[0]
            break
    
          case 'CALL_ADDR':
            // 2nnn - Call subroutine at nnn
            if (this.SP === 15) {
              this.halted = true
              throw new Error('Stack overflow.')
            }
    
            this.SP++
            this.stack[this.SP] = this.PC + 2
            this.PC = args[0]
            break
    
          case 'SE_VX_NN':
            // 3xnn - Skip next instruction if Vx = nn
            if (this.registers[args[0]] === args[1]) {
              this._skipInstruction()
            } else {
              this._nextInstruction()
            }
            break
    
          case 'SNE_VX_NN':
            // 4xnn - Skip next instruction if Vx != nn
            if (this.registers[args[0]] !== args[1]) {
              this._skipInstruction()
            } else {
              this._nextInstruction()
            }
            break
    
          case 'SE_VX_VY':
            // 5xy0 - Skip next instruction if Vx = Vy
            if (this.registers[args[0]] === this.registers[args[1]]) {
              this._skipInstruction()
            } else {
              this._nextInstruction()
            }
            break
    
          case 'LD_VX_NN':
            // 6xnn - Set Vx = nn
            this.registers[args[0]] = args[1]
            this._nextInstruction()
            break
    
          case 'ADD_VX_NN':
            // 7xnn - Set Vx = Vx + nn
            let v = this.registers[args[0]] + args[1]
            if (v > 255) {
              v -= 256
            }
            this.registers[args[0]] = v
            this._nextInstruction()
            break
    
          case 'LD_VX_VY':
            // 8xy0 - Set Vx = Vy
            this.registers[args[0]] = this.registers[args[1]]
            this._nextInstruction()
            break
    
          case 'OR_VX_VY':
            // 8xy1 - Set Vx = Vx OR Vy
            this.registers[args[0]] |= this.registers[args[1]]
            this._nextInstruction()
            break
    
          case 'AND_VX_VY':
            // 8xy2 - Set Vx = Vx AND Vy
            this.registers[args[0]] &= this.registers[args[1]]
            this._nextInstruction()
            break
    
          case 'XOR_VX_VY':
            // 8xy3 - Set Vx = Vx XOR Vy
            this.registers[args[0]] ^= this.registers[args[1]]
            this._nextInstruction()
            break
    
          case 'ADD_VX_VY':
            // 8xy4 - Set Vx = Vx + Vy, set VF = carry
            this.registers[0xf] = this.registers[args[0]] + this.registers[args[1]] > 0xff ? 1 : 0
            this.registers[args[0]] += this.registers[args[1]]
    
            this._nextInstruction()
            break
    
          case 'SUB_VX_VY':
            // 8xy5 - Set Vx = Vx - Vy, set VF = NOT borrow
            this.registers[0xf] = this.registers[args[0]] > this.registers[args[1]] ? 1 : 0
            this.registers[args[0]] -= this.registers[args[1]]
    
            this._nextInstruction()
            break
    
          case 'SHR_VX_VY':
            // 8xy6 - Set Vx = Vx SHR 1
            this.registers[0xf] = this.registers[args[0]] & 1
            this.registers[args[0]] >>= 1
            this._nextInstruction()
            break
    
          case 'SUBN_VX_VY':
            // 8xy7 - Set Vx = Vy - Vx, set VF = NOT borrow
            this.registers[0xf] = this.registers[args[1]] > this.registers[args[0]] ? 1 : 0
    
            this.registers[args[0]] = this.registers[args[1]] - this.registers[args[0]]
            this._nextInstruction()
            break
    
          case 'SHL_VX_VY':
            // 8xyE - Set Vx = Vx SHL 1
            this.registers[0xf] = this.registers[args[0]] >> 7
    
            this.registers[args[0]] <<= 1
            this._nextInstruction()
            break
    
          case 'SNE_VX_VY':
            // 9xy0 - Skip next instruction if Vx != Vy
            if (this.registers[args[0]] !== this.registers[args[1]]) {
              this._skipInstruction()
            } else {
              this._nextInstruction()
            }
            break
    
          case 'LD_I_ADDR':
            // Annn - Set I = nnn
            this.I = args[1]
            this._nextInstruction()
            break
    
          case 'JP_V0_ADDR':
            // Bnnn - Jump to location nnn + V0
            this.PC = this.registers[0] + args[1]
            break
    
          case 'RND_VX_NN':
            // Cxnn - Set Vx = random byte AND nn
            let random = Math.floor(Math.random() * 0xff)
            this.registers[args[0]] = random & args[1]
            this._nextInstruction()
            break
    
          case 'DRW_VX_VY_N':
            // Dxyn - Display n-byte sprite starting at memory location I at (Vx, Vy), set VF = collision
            if (this.I > 4095 - args[2]) {
              this.halted = true
              throw new Error('Memory out of bounds.')
            }
    
            // If no pixels are erased, set VF to 0
            this.registers[0xf] = 0
    
            // The interpreter reads n bytes from memory, starting at the address stored in I
            for (let i = 0; i < args[2]; i++) {
              let line = this.memory[this.I + i]
              // Each byte is a line of eight pixels
              for (let position = 0; position < 8; position++) {
                // Get the byte to set by position
                let value = line & (1 << (7 - position)) ? 1 : 0
                // If this causes any pixels to be erased, VF is set to 1
                let x = (this.registers[args[0]] + position) %Constants.DISPLAY_WIDTH // wrap around width
                let y = (this.registers[args[1]] + i) % Constants.DISPLAY_HEIGHT // wrap around height
    
                if (this.interface.drawPixel(x, y, value)) {
                  this.registers[0xf] = 1
                }
              }
            }
    
            this._nextInstruction()
            break
    
          case 'SKP_VX':
            // Ex9E - Skip next instruction if key with the value of Vx is pressed
            if (this.interface.getKeys() & (1 << this.registers[args[0]])) {
              this._skipInstruction()
            } else {
              this._nextInstruction()
            }
            break
    
          case 'SKNP_VX':
            // ExA1 - Skip next instruction if key with the value of Vx is not pressed
            if (!(this.interface.getKeys() & (1 << this.registers[args[0]]))) {
              this._skipInstruction()
            } else {
              this._nextInstruction()
            }
            break
    
          case 'LD_VX_DT':
            // Fx07 - Set Vx = delay timer value
            this.registers[args[0]] = this.DT
            this._nextInstruction()
            break
    
          case 'LD_VX_N':
            // Fx0A - Wait for a key press, store the value of the key in Vx
            const keyPress = this.interface.waitKey()
    
            if (!keyPress) {
              return
            }
    
            this.registers[args[0]] = keyPress
            this._nextInstruction()
            break
    
          case 'LD_DT_VX':
            // Fx15 - Set delay timer = Vx
            this.DT = this.registers[args[1]]
            this._nextInstruction()
            break
    
          case 'LD_ST_VX':
            // Fx18 - Set sound timer = Vx
            this.ST = this.registers[args[1]]
            if (this.ST > 0) {
              this.soundEnabled = true
              this.interface.enableSound()
            }
            this._nextInstruction()
            break
    
          case 'ADD_I_VX':
            // Fx1E - Set I = I + Vx
            this.I = this.I + this.registers[args[1]]
            this._nextInstruction()
            break
    
          case 'LD_F_VX':
            // Fx29 - Set I = location of sprite for digit Vx
            if (this.registers[args[1]] > 0xf) {
              this.halted = true
              throw new Error('Invalid digit.')
            }
    
            this.I = this.registers[args[1]] * 5
            this._nextInstruction()
            break
    
          case 'LD_B_VX':
            // Fx33 - Store BCD representation of Vx in memory locations I, I+1, and I+2
            // BCD means binary-coded decimal
            // If VX is 0xef, or 239, we want 2, 3, and 9 in I, I+1, and I+2
            if (this.I > 4093) {
              this.halted = true
              throw new Error('Memory out of bounds.')
            }
    
            let x = this.registers[args[1]]
            const a = Math.floor(x / 100) // for 239, a is 2
            x = x - a * 100 // subtract value of a * 100 from x (200)
            const b = Math.floor(x / 10) // x is now 39, b is 3
            x = x - b * 10 // subtract value of b * 10 from x (30)
            const c = Math.floor(x) // x is now 9
    
            this.memory[this.I] = a
            this.memory[this.I + 1] = b
            this.memory[this.I + 2] = c
    
            this._nextInstruction()
            break
    
          case 'LD_I_VX':
            // Fx55 - Store registers V0 through Vx in memory starting at location I
            if (this.I > 4095 - args[1]) {
              this.halted = true
              throw new Error('Memory out of bounds.')
            }
    
            for (let i = 0; i <= args[1]; i++) {
              this.memory[this.I + i] = this.registers[i]
            }
    
            this._nextInstruction()
            break
    
          case 'LD_VX_I':
            // Fx65 - Read registers V0 through Vx from memory starting at location I
            if (this.I > 4095 - args[0]) {
              this.halted = true
              throw new Error('Memory out of bounds.')
            }
    
            for (let i = 0; i <= args[0]; i++) {
              this.registers[i] = this.memory[this.I + i]
            }
    
            this._nextInstruction()
            break
    
          default:
            // Data word
            this.halted = true
            throw new Error('Illegal instruction.')
        }
        
    }
}
