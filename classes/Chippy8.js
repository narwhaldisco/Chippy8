const fs = require('fs');

const { CPU } = require('./CPU.js')
const { RomBuffer } = require('./RomBuffer.js');
const { TerminalInterface } = require('./interfaces/TerminalInterface')

const terminalInterface = new TerminalInterface()

var cpu = new CPU(terminalInterface);

// Load the rom
const rom = fs.readFileSync('web/roms/INVADERS');
if (!rom) throw new Error('File not found')

const rombuf = new RomBuffer(rom);

// Dumps contents of the rombuf for debug purposes
//var debug = rombuf.dump();
//console.log(debug);

// Load the CPU memory with the rombuffer
cpu.load(rombuf);
//cpu.debug_load();

var msg = `Hello Chippy World 0x` + cpu.PC.toString(16);
console.log(msg);

let timer = 0;

/*for(var i = 0; i < 1500; i++)
{
    // probably better to make the timer tick a function of the CPU speed
    timer++
    if(timer == 5)
    {
        cpu.tick()
        timer = 0;
    }
    cpu.step()
}*/

// Main loop to drive the interpreter
function cycle() {

    // probably better to make the timer tick a function of the CPU speed
    timer++
    if(timer == 5)
    {
        cpu.tick()
        timer = 0;
    }

    cpu.step()

    if (cpu.drawFlag) {
        cpu.renderDisplay()
        cpu.drawFlag = false;
    }    

    setTimeout(cycle, 3);
}

cycle()

