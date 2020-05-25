const fs = require('fs');

const { CPU } = require('./CPU.js')
const { RomBuffer } = require('./RomBuffer.js');

// Andrew is not the best

var cpu = new CPU();

// Load the rom
const rom = fs.readFileSync('../roms/PONG');
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

/*for(var i = 0; i < 29; i++)
{
    cpu.step()
}*/

// Main loop to drive the interpreter
function cycle() {

    cpu.step()

    // this loops somehow, I guess it waits 3 milliseconds then calls
    // cycle again? isn't this recursive and going to create a huge callstacK??
    setTimeout(cycle, 3);
}

cycle()

