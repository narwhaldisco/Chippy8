# Chippy8
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

An experimental chip8 emulator in javascript.

Stuck inside during COVID-19 I decided to take a crack at writing an emulator. The [Chip8](https://en.wikipedia.org/wiki/CHIP-8) was never actually a real machine, but a virtual machine so this project is technically an implementation of that virtual machine. Nevertheless it was a good starting point for learning how an emulator is created.

### [Check out the Web Demo](https://narwhaldisco.github.io/Chippy8/)

Runs locally in the terminal and on the web.

to run locally with node.js:

```
clone
npm install
npm run play:terminal
```

to build for the web:

```
clone
npm install
npm run build:web
cd web
```

I like to use [http-server](https://www.npmjs.com/package/http-server) to serve it locally.

## Acknowledgements

Done with the generous help from:

- [Writing an Emulator in JavaScript](https://www.taniarascia.com/writing-an-emulator-in-javascript-chip8/) by Tania Rascia. 
- [Cowgod's Chip-8 Technical Reference v1.0](http://devernay.free.fr/hacks/chip8/C8TECH10.HTM)
