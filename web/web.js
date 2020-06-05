let timer = 0

function cycle() {
  timer++

  if (timer % 5 === 0) {
    cpu.tick()
    timer = 0
  }

  cpu.step()

  setTimeout(cycle, 3)
}


async function loadRom() {
    //const rom = event.target.value
    const response = await fetch(`./roms/INVADERS`)
    const arrayBuffer = await response.arrayBuffer()
    const uint8View = new Uint8Array(arrayBuffer)
    const romBuffer = new RomBuffer(uint8View)
  
    //console.log(romBuffer);

    //cpu.interface.clearDisplay()
    //cpu.interface.disableSound()
    cpu.load(romBuffer)
    //displayInstructions(rom)

    cycle()
}

loadRom()

//cycle()
