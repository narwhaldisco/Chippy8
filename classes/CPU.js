const FONT_SET = require('../data/font')
const blessed = require('blessed')


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
        this.frameBuffer = [];

        // blessed stuff
        this.blessed = blessed
        this.screen = blessed.screen({ smartCSR: true })
        this.screen.title = 'Chippy8.js'
        this.color = blessed.helpers.attrToBinary({ fg: '#33ff66' })

        // Exit game
        this.screen.key(['escape', 'C-c'], () => {
            process.exit(0)
        })

        // debug stuff
        this.instNum = 0;
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

        // init frame buffer
        this.frameBuffer = []

        for (let i = 0; i < 32; i++) 
        {
            this.frameBuffer.push([])

            for (let j = 0; j < 64; j++) 
            {
                this.frameBuffer[i].push(0)
            }
        }
    }

    // manually load some code for debug purposes
    debug_load()
    {
        this.reset()

        // 0-80 in memory is reserved for font set
        for (let i = 0; i < FONT_SET.length; i++) 
        {
            this.memory[i] = FONT_SET[i]
        }

        // TEST CODE
        this.memory[0x200] = 0x60;
        this.memory[0x201] = 0x09; // LD_VX_B
        this.memory[0x202] = 0xf0; 
        this.memory[0x203] = 0x29; // LD_I_FONT
        this.memory[0x204] = 0xd0; 
        this.memory[0x205] = 0x15; // DRW_Vx_Vy_Nibble

        // init frame buffer
        this.frameBuffer = []

        for (let i = 0; i < 32; i++) 
        {
            this.frameBuffer.push([])

            for (let j = 0; j < 64; j++) 
            {
                this.frameBuffer[i].push(0)
            }
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
        this.frameBuffer = []

        // debug stuff
        this.instNum = 0;
    }

    tick()
    {
        //console.log("I have ticked DT: " + this.DT)

        // Drecrement the timers
        if(this.DT > 0)
        {
            this.DT = this.DT - 1;
        }

        if(this.ST > 0)
        {
            this.ST = this.ST -1;
        }
    }

    step()
    {
        // Fetch, decode and execute this bad boy
        var opcode = this.fetch();

        var instruction = this.decode(opcode);

        /*if(this.instNum > 500)
        {
            console.log("instNum: " + this.instNum + " decoded " + opcode.toString(16) + " to " + instruction.id)
        }*/
        
        this.execute(instruction);

        //this.renderDisplay()

        this.instNum++
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
            // Dxyn - DRW Vx, Vy nibble
            var id = "DRW_Vx_Vy_Nibble"
            var Vx = (opcode & 0x0f00) >> 8
            var Vy = (opcode & 0x00f0) >> 4
            var n  = (opcode & 0x000f)

            var args = {Vx, Vy, n}

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
            var args = (opcode & 0x0f00) >> 8

            return {id, args}
        }
        else if((opcode & 0xf000) == 0x3000)
        {
            // 3xkk - SE Vx, byte
            // Skip next instruction if Vx = kk.
            var id = "SE_Vx_B"

            var Vx = (opcode & 0x0f00) >> 8
            var kk = opcode & 0x00ff

            var args = {Vx, kk}

            return {id, args}
        }
        else if((opcode & 0xf000) == 0x4000)
        {
            // 4xkk - SNE Vx, byte
            // Skip next instruction if Vx != kk

            var id = "SNE_Vx_B"

            var Vx = (opcode & 0x0f00) >> 8
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
        else if((opcode & 0xffff) == 0x00ee)
        {
            // 00ee - Return
            var id = "RETURN"
            var args = ""

            return {id, args}
        }
        else if((opcode & 0xf0ff) == 0xf015)
        {
            // fx15 - Load DT with Vx
            var id = "LD_DT_Vx"
            var args = (opcode & 0x0f00)

            return {id, args}
        }
        else if((opcode & 0xf0ff) == 0xf018)
        {
            // fx18 - Load ST with Vx
            var id = "LD_ST_Vx"
            var args = (opcode & 0x0f00)

            return {id, args}
        }
        else if((opcode & 0xf0ff) == 0xf007)
        {
            // fx07 - Load Vx with DT
            var id = "LD_Vx_DT"
            var args = (opcode & 0x0f00)

            return {id, args}
        }
        else if((opcode & 0xf000) == 0xc000)
        {
            // cxkk - Load Vx with rand AND kk
            var id = "LD_Vx_RAND_AND_B"
            
            var Vx = (opcode & 0x0f00) >> 8
            var kk = opcode & 0x00ff

            var args = {Vx, kk}

            return {id, args}
        }
        else if((opcode & 0xf0ff) == 0xe0a1)
        {
            // exa1 - Skip next instruction if key with the value of Vx is NOT pressed

            var id = "SKNP_Vx"
            var args = (opcode & 0x0f00) >> 8

            return {id, args}
        }
        else if((opcode & 0xf00f) == 0x8000)
        {
            // 8xy0 - Set Vx = Vy.

            var id = "LD_Vx_Vy"

            var Vx = (opcode & 0x0f00) >> 8
            var Vy = (opcode & 0x00f0) >> 4

            var args = {Vx, Vy};

            return {id, args}
        }
        else if((opcode & 0xf00f) == 0x8002)
        {
            // 8xy2 - Set Vx = Vx AND Vy.

            var id = "Vx_AND_Vy"

            var Vx = (opcode & 0x0f00) >> 8
            var Vy = (opcode & 0x00f0) >> 4

            var args = {Vx, Vy};

            return {id, args}
        }
        else if((opcode & 0xf00f) == 0x8005)
        {
            // 8xy5 - Set Vx = Vx - Vy, set VF = NOT borrow.

            var id = "SUB_Vx_Vy"

            var Vx = (opcode & 0x0f00) >> 8
            var Vy = (opcode & 0x00f0) >> 4

            var args = {Vx, Vy};

            return {id, args}
        }
        else if((opcode & 0xf00f) == 0x800E)
        {
            // 8xyE - Set Vx = Vx SHL 1.
            // Why does this one seem to have a bunch of unused operands???
            // Apparently there is confusion in the community lol... most implementations and code just treat
            // this opcode as I have it implemented here.

            var id = "SHL_Vx"
            var args = (opcode & 0x0f00) >> 8;

            return {id, args}
        }
        else if((opcode & 0xf00f) == 0x8004)
        {
            // 8xy4 - Set Vx = Vx + Vy, set VF = carry

            var id = "ADD_Vx_Vy"

            var Vx = (opcode & 0x0f00) >> 8
            var Vy = (opcode & 0x00f0) >> 4

            var args = {Vx, Vy}

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

                //console.log('reg: ' + reg + ' kk: ' + kk)

                this.advancePC()

                break;
            case 'LD_I_Addr':
                // Annn - LD I, addr
                this.I = args

                this.advancePC()

                break;
            case 'DRW_Vx_Vy_Nibble':
                // Dxyn - DRW Vx, Vy nibble

                // Display n-byte sprite starting at memory location I at (Vx, Vy), set VF = collision.
                // The interpreter reads n bytes from memory, starting at the address stored in I. 
                // These bytes are then displayed as sprites on screen at coordinates (Vx, Vy). Sprites are XORed onto the existing screen. 
                // If this causes any pixels to be erased, VF is set to 1, otherwise it is set to 0. If the sprite is positioned so part of 
                // it is outside the coordinates of the display, it wraps around to the opposite side of the screen.

                var Vx = args.Vx
                var Vy = args.Vy

                this.checkRegister(Vx)
                this.checkRegister(Vy)

                // n denotes how tall the sprite is really
                // sprite is always 8 bits wide
                var n  = args.n

                var startx = this.registers[Vx];
                var starty = this.registers[Vy];

                //console.log('V' + Vx.toString(16) + ': ' + startx + ' V' + Vy.toString(16) + ': ' + starty)

                var collision = false

                // for each row
                for(var i = 0; i < n; i++)
                {
                    //console.log('I: ' + this.I)
                    //console.log(this.memory[this.I+i].toString(2))

                    // for each col in this row
                    // go bit by bit and set the framebuffer
                    for(var j = 0; j < 8; j++)
                    {
                        var col = ((starty+i) % 32)
                        var row = ((startx+j) % 64)

                        var newBit = ((this.memory[this.I+i] << j) & 0x80)

                        //console.log('col: ' + col + ' row: ' + row)

                        // If we are about to erase a pixel, remember so we can set Vf
                        if(this.frameBuffer[col][row] & newBit)
                        {
                            collision = true
                        }

                        this.frameBuffer[col][row] ^= newBit
                    }
                }

                // Set Vf if we had a collision, otherwise unset it
                if(collision == true)
                {
                    this.registers[0xf] = 1
                }
                else
                {
                    this.registers[0xf] = 0
                }

                this.renderDisplay()

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

                console.log(this.I)

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

            case 'SNE_Vx_B':
                // 4xkk - SNE Vx, byte
                // Skip next instruction if Vx != kk.

                var reg = args.Vx
                var kk  = args.kk

                this.checkRegister(reg)

                // advance two instructions if the register does not match the byte
                if(this.registers[reg] != kk)
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

                var value = this.registers[reg]

                if(value*5 > 0x80)
                {
                    throw new error ('bad hex character requested: ' + value*5)
                }

                // the hex sprites are 5 lines tall, so mult by 5
                this.I = value*5

                this.advancePC()

                break;
            case 'RETURN':
                // Return from a subroutine.
                // The interpreter sets the program counter to the address at the top of the stack, then subtracts 1 from the stack pointer.

                this.PC = this.stack[this.SP];

                this.SP = this.SP - 1;

                this.advancePC()

                break;
            case 'LD_Vx_Vy':
                // Set Vx = Vy.
                // Stores the value of register Vy in register Vx.

                var Vx = args.Vx
                var Vy = args.Vy

                this.checkRegister(Vx)
                this.checkRegister(Vy)

                this.registers[Vx] = this.registers[Vy]

                this.advancePC()

                break;
            case 'LD_DT_Vx':
                // Set delay timer = Vx.
                // DT is set equal to the value of Vx.

                var reg = args;

                this.checkRegister(reg)

                this.DT = this.registers[reg]

                this.advancePC()

                break;
            case 'LD_ST_Vx':
                // Set sound delay timer = Vx.
                // ST is set equal to the value of Vx.

                var reg = args;

                this.checkRegister(reg)

                this.ST = this.registers[reg]

                this.advancePC()

                break;
            case 'LD_Vx_DT':
                // Set Vx = delay timer value.
                // The value of DT is placed into Vx.

                var reg = args;

                this.checkRegister(reg)

                this.registers[reg] = this.DT

                this.advancePC()

                break;
            case 'LD_Vx_RAND_AND_B':
                // Set Vx = random byte AND kk.
                // The interpreter generates a random number from 0 to 255, which is then ANDed with the value kk. 
                // The results are stored in Vx.

                var reg = args.Vx;
                var kk = args.kk;

                this.checkRegister(reg)

                var rand = Math.floor((Math.random() * 255));

                var val = (rand & kk)

                //console.log("rand: " + rand + " val: " + val)

                this.registers[reg] = val

                this.advancePC()

                break;
            case 'SKNP_Vx':

                //TODO!!!! actually implement key presses

                // Skip next instruction if key with the value of Vx is NOT pressed.
                // Checks the keyboard, and if the key corresponding to the value of Vx is currently in the up position, PC is increased by 2.
                var reg = args;

                this.checkRegister(reg)

                // if key is NOT pressed...
                if(true)
                {
                    this.PC = this.PC + 4
                }
                else
                {
                    this.advancePC()
                }

                break;
            case 'Vx_AND_Vy':
                // Set Vx = Vx AND Vy.
                // Performs a bitwise AND on the values of Vx and Vy, then stores the result in Vx.

                var Vx = args.Vx
                var Vy = args.Vy
                
                this.checkRegister(Vx)
                this.checkRegister(Vy)

                this.registers[Vx] = (this.registers[Vx] & this.registers[Vy])

                this.advancePC()

                break;
            case 'SHL_Vx':
                // Set Vx = Vx SHL 1.
                // If the most-significant bit of Vx is 1, then VF is set to 1, otherwise to 0. Then Vx is multiplied by 2.

                var reg = args;

                this.checkRegister(reg)

                // Put most significant bit into Vf
                this.registers[0xf] = (this.registers[reg] >> 7)

                // Mulitply Vx by 2
                this.registers[reg] <<= 1;

                this.advancePC()

                break;
            case 'ADD_Vx_Vy':

                // Set Vx = Vx + Vy, set VF = carry.
                // The values of Vx and Vy are added together. If the result is greater than 8 bits (i.e., > 255,) VF is set to 1, otherwise 0. 

                var Vx = args.Vx
                var Vy = args.Vy

                this.checkRegister(Vx)
                this.checkRegister(Vy)

                var sum = this.registers[Vx] + this.registers[Vy]

                this.registers[Vx] = sum

                if(sum > 255)
                {
                    this.registers[0xf] = 1
                }
                else
                {
                    this.registers[0xf] = 0
                }

                this.advancePC()
            
                break;
            case 'SUB_Vx_Vy':
                // Set Vx = Vx - Vy, set VF = NOT borrow.
                // If Vx > Vy, then VF is set to 1, otherwise 0. Then Vy is subtracted from Vx, and the results stored in Vx.

                var Vx = args.Vx
                var Vy = args.Vy

                this.checkRegister(Vx)
                this.checkRegister(Vy)

                this.registers[Vx] = this.registers[Vx] - this.registers[Vy]

                if(this.registers[Vx] > this.registers[Vy])
                {
                    this.registers[0xf] = 1
                }
                else
                {
                    this.registers[0xf] = 0
                }

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

    // Mock display only
    renderDisplay() {
        for(var row = 0; row < 32; row++)
        {
            for(var col = 0; col < 64; col++)
            {
                if(this.frameBuffer[row][col] == 0)
                {
                    this.screen.clearRegion(col, col + 1, row, row + 1)
                }
                else
                {
                    this.screen.fillRegion(this.color, '█', col, col + 1, row, row + 1)
                }
            }
        }

        this.screen.render()

        // old console.log renderer below
        
        /*let grid = ''

        for(var row = 0; row < 32; row++)
        {
            for(var col = 0; col < 64; col++)
            {
                if(this.frameBuffer[row][col] == 0)
                {
                    grid += ' '
                }
                else
                {
                    grid += '█'
                }

                // below will use 0s and 1s
                //grid += this.frameBuffer[row][col].toString(2)
            }
            grid += '\n'
        }

        console.log(grid)*/
    }

} // end CPU

// export CPU
module.exports = {
    CPU,
  }
  