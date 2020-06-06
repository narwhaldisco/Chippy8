let timer = 0

function cycle() {
  timer++

  if (timer % 5 === 0) {
    cpu.tick()
    timer = 0
  }

  if(!cpu.halted)
  {
    for (var i = 0; i < 7; i++) {
      cpu.step()
    }
  }

  if (cpu.drawFlag) {
    cpu.renderDisplay()
    cpu.drawFlag = false;
  }

  requestAnimationFrame(cycle);
}


async function loadRom() {
  const rom = event.target.value
  const response = await fetch(`./roms/${rom}`)
  const arrayBuffer = await response.arrayBuffer()
  const uint8View = new Uint8Array(arrayBuffer)
  const romBuffer = new RomBuffer(uint8View)

  cpu.load(romBuffer)
}

document.querySelector('select').addEventListener('change', loadRom)

requestAnimationFrame(cycle);