const keyMap = require('../../data/keyMap')

class WebInterface{
    constructor() {

        // Screen stuff
        this.screen = document.querySelector('canvas')
        this.multiplier = 10
        this.screen.width = 64 * this.multiplier
        this.screen.height = 32 * this.multiplier
        this.context = this.screen.getContext('2d')
        this.context.fillStyle = 'black'
        this.context.fillRect(0, 0, this.screen.width, this.screen.height)

        // Keys
        this.keys = 0
        this.keyPressed = undefined

        // key down event
        document.addEventListener('keydown', event => {
            const keyIndex = keyMap.indexOf(event.key)
        
            if (keyIndex > -1) {
                this.setKeys(keyIndex)
            }
        })

        // hey, a proper key up event
        document.addEventListener('keyup', event => {
            this.resetKeys()
        })
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
        // web / canvas renderer below
        for(var row = 0; row < 32; row++)
        {
            for(var col = 0; col < 64; col++)
            {
                if(frameBuffer[row][col] == 0)
                {
                    this.context.fillStyle = 'white'
                    this.context.fillRect(
                        col * this.multiplier,
                        row * this.multiplier,
                        this.multiplier,
                        this.multiplier
                    )
              
                }
                else
                {
                    this.context.fillStyle = 'black'
                    this.context.fillRect(
                        col * this.multiplier,
                        row * this.multiplier,
                        this.multiplier,
                        this.multiplier)
                }
            }
        }
    }
}

module.exports = {
    WebInterface,
  }  