
// Chip8 CPU class
// Defines the CPU itself and logic to execute programs
class CPU {
    constructor() {
      this.memory = new Uint8Array(4096)
      this.registers = new Uint8Array(16)
      this.stack = new Uint16Array(16)
      this.ST = 0
      this.DT = 0
      this.I = 0
      this.SP = -1
      this.PC = 0x200
    }

    // Load buffer into memory
    load(romBuffer) {
        this.reset()

        romBuffer.forEach((opcode, i) => {
            this.memory[i] = opcode
        })
    }

    reset()
    {
        // clear mem / registers / other stuff?
    }

    fetch()
    {
        return this.memory[this.PC];
    }
    
    decode(opcode)
    {
    
    }
    
    execute(instruction)
    {
        const { id, args } = instruction;
    
        // Big switch case of all instructions
        switch(id)
        {
            case 'ADD_VX_VY':
                break;
            default:
                break;
        }
    }

} // end CPU

// export CPU
module.exports = {
    CPU,
  }
  