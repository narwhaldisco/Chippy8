const FONT_SET = require('../data/font')

// Chip8 CPU class
// Defines the CPU itself and logic to execute programs

/*      * 16 x 8-bit general purpose registers (V0 - VF**)
        * 1 x 16-bit index register (I)
        * 1 x 16-bit stack pointer (SP)
        * 1 x 16-bit program counter (PC)
        * 1 x 8-bit delay timer (DT)
        * 1 x 8-bit sound timer (ST)
        ** VF is a special register - it is used to store the overflow bit
*/

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

        // 0-80 in memory is reserved for font set
        for (let i = 0; i < FONT_SET.length; i++) 
        {
            this.memory[i] = FONT_SET[i]
        }

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

        console.log("decoded " + opcode.toString(16) + " to " + instruction.id)
        
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
        //console.log("decoding: " + opcode.toString(16))

        // Need to figure out which instruction this is, and what are the arguments and
        // return it in some kind of javascripty object to pass to execute().
        if((opcode & 0xf000) == 0x1000)
        {
            // 1nnn - Jp addr 
            // Jump to location nnn.
            var id = "JP"
            var args = (opcode & 0x0fff)

            return {id, args}
        }
        else if((opcode & 0xf000) == 0x6000)
        {  
            // 6xkk - LD Vx, byte
            // interpreter puts the value kk into register Vx
            var id = "LD_VX_B"
            var Vx = (opcode & 0x0f00) >> 8;
            var kk = (opcode & 0x00ff);

            var args = {Vx, kk}

            return {id, args}
        }
        else if((opcode & 0xf000) == 0xa000)
        {
            // Annn - LD I, addr
            // Set I = nnn.
            // The value of reigster I is set to nnn
            var id = "LD_I_Addr"
            var args = (opcode & 0x0fff)

            return {id, args}
        }
        else if((opcode & 0xf000) == 0xd000)
        {
            // TO DO Dxyn - DRW Vx, Vy nibble
            var id = "DRW_Vx_Vy_Nibble"
            var args = (opcode & 0x0fff)
            return {id, args}
        }
        else if((opcode & 0xf000) == 0x7000)
        {
            // Set Vx = Vx + kk
            // Adds the value kk to the value of register Vx, then stores the result in Vx
            var id = "ADD_Vx_B"
            var Vx = (opcode & 0x0f00) >> 8;
            var kk = (opcode & 0x00ff);

            var args = {Vx, kk}

            return {id, args}
        }
        else if((opcode & 0xf0ff) == 0xf01e)
        {
            // Fx1E - ADD I, Vx
            // Set I = I + Vx
            var id = "ADD_I_Vx"
            var args = opcode & 0x0f00 >> 8

            return {id, args}
        }
        else if((opcode & 0xf000) == 0x3000)
        {
            // 3xkk - SE Vx, byte
            // Skip next instruction if Vx = kk.
            var id = "SE_Vx_B"

            var Vx = opcode & 0x0f00 >> 8
            var kk = opcode & 0x00ff

            var args = {Vx, kk}

            return {id, args}
        }
        else if((opcode & 0xf000) == 0x2000)
        {
            // 2nnn - CALL
            // Push PC onto stack, jump to nnn

            var id = "CALL"
            var args = opcode & 0x0fff;

            return {id, args}
        }
        else if((opcode & 0xf0ff) == 0xf033)
        {
            // fx33 - Store BCD representation of Vx in memory locations I, I+1, and I+2.

            var id = "BCD_Vx"
            var args = (opcode & 0x0f00) >> 8

            return {id, args}
        }
        else if((opcode & 0xf0ff) == 0xf065)
        {
            // fx64 - load V0 through Vx with memory starting at I

            var id = 'LD_V0-Vx_MEM(I)'
            var args = (opcode & 0x0f00) >> 8
            
            return {id, args}
        }
        else if((opcode & 0xf0ff) == 0xf029)
        {
            // fx29 - Loads I with the location of hex digit x from the FONT_SET thing
            var id = "LD_I_FONT"
            var args = (opcode & 0x0f00) >> 8

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
                // 1nnn - Jp addr 
                this.PC = args;

                break;
            case 'LD_VX_B':
                // 6xkk - LD Vx, byte
                var reg = args.Vx
                var kk = args.kk

                this.checkRegister(reg)

                this.registers[reg] = kk

                this.advancePC()

                break;
            case 'LD_I_Addr':
                // Annn - LD I, addr
                this.I = args

                this.advancePC()

                break;
            case 'DRW_Vx_Vy_Nibble':
                // TO DO Dxyn - DRW Vx, Vy nibble
                this.PC = this.PC + 2

                break;
            case 'ADD_Vx_B':
                //7xkk - ADD Vx, byte
                var reg = args.Vx
                var kk = args.kk

                this.checkRegister(reg)

                this.registers[reg] += kk

                this.advancePC()

                break;
            case 'ADD_I_Vx':
                // Fx1E - ADD I, Vx
                // Set I = I + Vx
                var reg = args

                this.checkRegister(reg)

                this.I += this.registers[reg];

                this.advancePC()

                break;
            case 'SE_Vx_B':
                // 3xkk - SE Vx, byte
                // Skip next instruction if Vx = kk.

                var reg = args.Vx
                var kk  = args.kk

                this.checkRegister(reg)

                // advance two instructions if the register matches the byte
                if(this.registers[reg] == kk)
                {
                    this.PC = this.PC + 4
                }
                // else just go to next instruction
                else
                {
                    this.advancePC()
                }

                break;
            case 'CALL':
                // 2nnn - CALL
                // push PC onto stack, then jump to nnn

                // This and return is the only way to interact with the stack lol
                this.SP = this.SP + 1
                this.stack[this.SP] = this.PC

                this.PC = args;

                break;
            case 'BCD_Vx':
                // Store BCD representation of Vx in memory locations I, I+1, and I+2.
                // The interpreter takes the decimal value of Vx, and places the hundreds 
                // digit in memory at location in I, the tens digit at location I+1, and 
                // the ones digit at location I+2.

                var value = this.registers[args]

                //console.log("reg is: " + args + " value there is: " + value)

                // POSSIBLE BUG: I don't think the Math.floor solution works for negative numbers.
                // But in that situation, what even is the BCD of a negative number???
                var ones = value % 10;
                value = Math.floor(value/10);
                var tens = value % 10;
                value = Math.floor(value/10);
                var hundreds = value % 10;
            
                //console.log("ones: " + ones + " tens: " + tens + " hundreds: " + hundreds)

                this.memory[this.I] = hundreds;
                this.memory[this.I+1] = tens;
                this.memory[this.I+2] = ones;

                this.advancePC()

                break;
            case 'LD_V0-Vx_MEM(I)':
                // Read registers V0 through Vx from memory starting at location I.
                // The interpreter reads values from memory starting at location I into registers V0 through Vx.

                var endReg = args;

                this.checkRegister(endReg);

                for(var i = 0; i <= endReg; i++)
                {
                    this.registers[i] = this.memory[this.I + i]
                }

                this.advancePC()

                break;
            case 'LD_I_FONT':
                // Set I = location of sprite for digit Vx.
                // The value of I is set to the location for the hexadecimal sprite corresponding to the value of Vx. 
                var reg = args;
                this.checkRegister(reg)

                this.value = this.registers[reg]

                if(value*5 > 0x80)
                {
                    throw new error ('bad hex character requested: ' + value*5)
                }

                // the hex sprites are 5 lines tall, so mult by 5
                this.I = this.memory[value*5]

                this.advancePC()

                break;
            default:
                throw new Error('cant execute instruction: ' + id)
                break;
        }
    }

    // advance program counter 1 instruction
    advancePC()
    {
        this.PC = this.PC + 2
    }

    // Make sure this is a valid register
    checkRegister(reg)
    {
        // Only 16 registers, throw an error if we try and access one beyond
        if(reg > 15)
        {
            throw new Error('bad register: ' + reg)
        }   
    }

} // end CPU

// export CPU
module.exports = {
    CPU,
  }
  