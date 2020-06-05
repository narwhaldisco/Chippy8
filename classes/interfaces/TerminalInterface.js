const keyMap = require('../../data/keyMap')
const blessed = require('blessed')

class TerminalInterface{
    constructor() {

        // blessed stuff
        this.blessed = blessed
        this.screen = blessed.screen({ smartCSR: true })
        this.screen.title = 'Chippy8.js'
        this.color = blessed.helpers.attrToBinary({ fg: '#33ff66' })
        
        // Exit game
        this.screen.key(['escape', 'C-c'], () => {
            process.exit(0)
        })

        // key down event
        this.screen.on('keypress', (_, key) => {
            const keyIndex = keyMap.indexOf(key.full)
    
            if (keyIndex > -1) {
            this.setKeys(keyIndex)
            }
        })

        // key up?
        setInterval(() => {
            // Emulate a keyup event to clear all pressed keys
            this.resetKeys()
          }, 100)

        // Keys
        this.keys = 0
        this.keyPressed = undefined
    }

    // return keys
    getKeys() {
        return this.keys
    }

    // return keys
    getKeyPressed() {
        return this.keyPressed
    }
    
    // update the keys/keypressed vars
    setKeys(keyIndex) {
        let keyMask = 1 << keyIndex

        this.keys = this.keys | keyMask
        this.keyPressed = keyIndex
    }

    // clear the keys/keypressed vars
    resetKeys() {
        this.keys = 0
        this.keyPressed = undefined
    }

    render(frameBuffer){
        // blessed renderer below
        for(var row = 0; row < 32; row++)
        {
            for(var col = 0; col < 64; col++)
            {
                if(frameBuffer[row][col] == 0)
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
    }
}

module.exports = {
    TerminalInterface,
  }  