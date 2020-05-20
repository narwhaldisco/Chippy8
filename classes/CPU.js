
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

    step()
    {
        // Fetch, decode and execute this bad boy
        var opcode = this.fetch();

        var instruction = this.decode(opcode);
        
        this.execute(instruction);
    }

    fetch()
    {
        // Memory is an array of Uint8 and an opcode is 16 bits, which means it occupies two
        // indices in memory. To return the full 16 bit opcode, we left shift the first byte
        // by a byte to make it the most significat 2 nibbles, then OR it with the next byte
        // to pick up the least significant two nibbles
        return (this.memory[this.PC] << 8 | this.memory[this.PC + 1]);
    }
    
    decode(opcode)
    {
        console.log("decoding: " + opcode.toString(16))

        // Need to figure out which instruction this is, and what are the arguments and
        // return it in some kind of javascripty object to pass to execute().
        if((opcode & 0x1000) == 0x1000)
        {
            var id = "JP"
            var args = (opcode & 0x0fff)

            return {id, args}
        }
        else if((opcode & 0x6000) == 0x6000)
        {
            var id = "LD_VX_B"
            var Vx = (opcode & 0x0f00) >> 8;
            var byte = (opcode & 0x00ff);

            //console.log(Vx.toString())
            
            var args = {Vx, byte}

            return {id, args}
        }
        else if((opcode & 0xa000) == 0xa000)
        {
            var id = "LD_I_Addr"
            var args = (opcode & 0x0fff)

            return {id, args}
        }
        else
        {
            throw new Error('cant decode opcode: ' + opcode.toString(16))
        }
    }
    
    execute(instruction)
    {
        const { id, args } = instruction;
    
        // Big switch case of all instructions
        switch(id)
        {
            case 'JP':

                //console.log('JP PC before: ' + this.PC.toString(16))
                this.PC = args;
                //console.log('JP PC after: ' + this.PC.toString(16))

                break;
            case 'LD_VX_B':
            
                var reg = args.Vx
                var byte = args.byte

                // Make sure register index is valid
                if(reg > 15)
                {
                    throw new Error('bad register: ' + reg)
                }

                this.registers[reg] = byte

                this.PC = this.PC + 2

                //console.log("reg: " + reg + " byte: " + byte)

                break;
            case 'LD_I_Addr':

                this.I = args
                console.log("I value is : " + this.I.toString(16))
                this.PC = this.PC + 2

                break;
            default:
                throw new Error('cant execute instruction: ' + id)
                break;
        }
    }

} // end CPU

// export CPU
module.exports = {
    CPU,
  }
  