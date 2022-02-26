let timer = 0
      import constructors from "./Browser.js"
    const {cpu, RomBuffer} = constructors
      function cycle(){
          timer++
          if(timer % 5 == 0){
              cpu.tick()
              
              timer =0
          }
          if(!cpu.healted){
              cpu.step()
          }
          setTimeout(cycle,3)
      }
      async function loadRoom(){
          const room = event.target.value
          const response = await fetch(`./roms/${room}`)
          const arrayBuffer = await response.arrayBuffer()
          const unit8View = new Uint8Array(arrayBuffer)
          const Rombuffer = new RomBuffer(unit8View)
          cpu.interface.clearDisplay()
        //   cpu.interface.enableSound()
          cpu.load(Rombuffer)
          displayInstructions(room)
      }
      function displayInstructions(rom){
          let instructions
          switch(rom){
              case "CONNECT4":
                  instructions = `Q = go left
                  E = go right
                  W = drop a coin
                  
                  the coin color alternates with each play.
                  this game has no win detection
                  `
                  break
                  case 'TETRIS':
                      instructions = `W = go left
                E = go right
                R = fall faster
                Q = rotate piece`
                      break
                    case 'PONG':
                      instructions = `Player 1:
                      
                2 = go up
                Q = go down
                Player 2:
                Z = go up
                X = go down`
                      break
                    case 'INVADERS':
                      instructions = `W = start game
                W = shoot
                Q = go left
                E = go right`
                      break
          }
          const instructionsDisplay = document.querySelector(".instructions")
          instructionsDisplay.textContent = instructions
      }
      document.querySelector("select").addEventListener("change",loadRoom)
      cycle()