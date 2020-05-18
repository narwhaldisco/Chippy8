const { CPU } = require('./CPU.js')
const { RomBuffer } = require('./RomBuffer.js');
var fs = require('fs');

var cpu = new CPU();

var rom = fs.readFileSync('../roms/INVADERS', 'utf8');
var rombuf = new RomBuffer(rom);

cpu.load(rombuf);

var msg = `Hello Chippy World ${cpu.PC}`;
console.log(msg);

