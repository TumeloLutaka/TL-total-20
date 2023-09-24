const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')

// // Importing Gamestate class
const { createGame, createRoom, getGameState, playerAction, roomExists, removeRoom } = require('./public/javascript/gameState.js')
// const Deck = require('./public/javascript/deck.js') 
// // const { ROOMS } = require('./public/javascript/gameplay.js')

// Creating server
const app = express()
const server = http.createServer(app)
const io = socketio(server)

// Setting static folder
app.use(express.static(path.join(__dirname, 'public')));

// Import routes
const indexRouter = require('./routes/index.js');

// Routing
app.use('/', indexRouter)

const PORT = 3000 || process.env.PORT

server.listen(PORT, () => {
    console.log("Server is running on port: " + PORT)
})

// Importing socket .io
io.on('connection', socket => {
    //Greet player when they connect
      socket.emit('greeting', 'Welcome player press join game to go to Game Screen')

      // Player trying to create game
      socket.on('create-game', roomId => {
        //Check if room exists
        if(roomExists(roomId)){ 
          socket.emit('greeting', `Failure, Room: ${roomId}, already exists, try a different room name`)
        }
        else { 
          socket.emit('greeting', `Success, Room: ${roomId} does not exist wait for other player to join`)
          socket.emit('set-player', 1)
          socket.join(roomId)
          createRoom(roomId) 
        }
      })

      //Plyer trying to join a specific game
      socket.on('join-game', roomId => {
        // Check if room actually exists
        if(roomExists(roomId)){
          // Join room which has the id
          socket.emit('greeting', `Success, room: ${roomId}, exists, joining...`)
          socket.emit('set-player', 2)
          socket.join(roomId)

          // Create a room with a game state
          createGame(roomId)
          // Send game state to users
          io.to(roomId).emit('goto-game-screen', roomId)
        }
        else {
          socket.emit('greeting', `Failure, No such room: ${roomId}, exists`)
        }
      })
      
      // Called when both players have joined the game 
      socket.on('init-game', roomId => {
        socket.join(roomId)
        runGameInterval(roomId)
      })

      // Called when player clicks on a cards 
      socket.on('player-action', client => {
        const data = JSON.parse(client)
        switch(data.action){
          case 'play-card':
            playerAction(data.roomId, data.action, {player: data.player, cardIndex:data.cardIndex})
            break
          case 'lock-play':
          case 'lock-flip':
          case 'draw-card':
            playerAction(data.roomId, data.action, {player: data.player})
            break
          case 'next-phase':
            playerAction(data.roomId, data.action, {phase:data.phase})
            break
        }

        // Sending new data to players after player action
        runGameInterval(data.roomId)
      })
})

io.on('disconnect', () => {
  localStorage.removeItem('roomId')
  sessionStorage.removeItem('player')
})

// Function to send game state to users in room
function runGameInterval(roomId) {
  const gameState = getGameState(roomId)
  
  io.to(roomId).emit('run-game', JSON.stringify(gameState))
  
  // Checking if room game is over and deleting room
  if(gameState.winner !== null){
    removeRoom(roomId)
    clearInterval(interval)
  }

  
}

// // app.set('view engine', 'ejs'); // Set EJS as the view engine
// // app.set('views', path.join(__dirname, 'views'))