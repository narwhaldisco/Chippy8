const fs = require('fs');

const { CPU } = require('./CPU.js')
const { RomBuffer } = require('./RomBuffer.js');


var cpu = new CPU();

// Load the rom
const rom = fs.readFileSync('../roms/INVADERS');
if (!rom) throw new Error('File not found')

const rombuf = new RomBuffer(rom);

// Dumps contents of the rombuf for debug purposes
var debug = rombuf.dump();
console.log(debug);

// Load the CPU memory with the rombuffer
cpu.load(rombuf);

var msg = `Hello Chippy World ${cpu.PC}`;
console.log(msg);

