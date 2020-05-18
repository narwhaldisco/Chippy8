
// Chip8 CPU class
// Defines the CPU itself and logic to execute programs
class CPU {
    constructor() {
      this.memory = new Uint8Array(4096);
      this.registers = new Uint8Array(16);
      this.stack = new Uint16Array(16);
      this.ST = 0;
      this.DT = 0;
      this.I = 0;
      this.SP = -1;
      this.PC = 0x200;
    }

    // Load buffer into memory
    load(romBuffer) {
        this.reset()

        // TODO: load fontset into memory, and anything else that is reserved.

        // Get ROM data from ROM buffer
        const romData = romBuffer.data;
        let memoryStart = 0x200;

        // put the rom data into memory, starting at 0x200
        // memory is an 8bit array, but opcodes are 16bit, so each opcode
        // occupies two elements in the array.
        // Also this is big endian, so most significant byte goes first.
        for(let i = 0; i < romData.length; i++)
        {
            // put most significant byte into first element.
            // get most significant byte by just shifting 
            // it right by a single byte. (i.e., 0x1234 would be 0x12)
            this.memory[memoryStart + 2*i] = romData[i] >> 8;

            // put least significant byte into second element.
            // get least significant byte by masking off the 
            // high 8 bits. (i.e., 0x1234 would be 0x34)
            this.memory[memoryStart + 2*i + 1] = romData[i] & 0x00ff
        }
    }

    reset()
    {
        // clear memory / registers / other stuff?

        this.memory = new Uint8Array(4096);
        this.registers = new Uint8Array(16);
        this.stack = new Uint16Array(16);
        this.ST = 0;
        this.DT = 0;
        this.I = 0;
        this.SP = -1;
        this.PC = 0x200;
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
  