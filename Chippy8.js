const { CPU } = require('./CPU.js')

var cpu = new CPU();

var msg = `Hello World ${cpu.PC}`;
console.log(msg);

