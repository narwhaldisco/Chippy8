const { CPU } = require('./classes/CPU')
const { RomBuffer } = require('./classes/RomBuffer')

const cpu = new CPU()

// Set CPU and Rom Buffer to the global object, which will become window in the
// browser after bundling.
global.cpu = cpu
global.RomBuffer = RomBuffer

