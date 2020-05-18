// borrowed from https://www.taniarascia.com/writing-an-emulator-in-javascript-chip8/

class RomBuffer {
    /**
     * @param {binary} fileContents ROM binary
     */
    constructor(fileContents) {
      this.data = []
  
      // Read the raw data buffer from the file
      const buffer = fileContents
  
      // Create 16-bit big endian opcodes from the buffer
      for (let i = 0; i < buffer.length; i += 2) {
        this.data.push((buffer[i] << 8) | (buffer[i + 1] << 0))
      }
    }
  }

// export RomBuffer
module.exports = {
  RomBuffer,
}