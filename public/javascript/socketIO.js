const socketIO = require('socket.io')
const database = require('./database')

function setupSocket(server) {
    const io = socketIO(server)

    // User connecting to server/website.
    io.on('connection', socket => {

        //================ SERVER -> CLIENT ================//
        // TODO: Remove this code, this is for error handling only.
        socket.broadcast.emit('message', 'A player has joined')
        // Show new user currently open rooms.
        socket.emit('get-rooms', database.getRooms())

        //================ CLIENT -> SERVER ================//
        //DEbug
        socket.on('client-message', data => {
            console.log(data)
        })
        // Player trying to create game
        socket.on('create-game', roomId => {
            //Check if room exists
            if (database.roomExists(roomId)) {
                socket.emit('message', `Failure, Room: ${roomId}, already exists, try a different room name`)
            }
            else {
                // Allow player to create room and send success message
                socket.emit('set-player', 1)
                socket.join(roomId)
                database.createRoom(roomId)

                // Update the list of rooms for all players in open matches.
                io.emit('get-rooms', database.getRooms())
                socket.emit('message', `Success, Room: ${roomId} does not exist wait for other player to join. Number of Rooms: ` + database.getRooms().length)
            }
        })

        //Player trying to join a specific game
        socket.on('join-game', roomId => {
            // Check if room actually exists
            if (database.roomExists(roomId)) {
                // Join room which has the id
                socket.emit('message', `Success, room: ${roomId}, exists, joining...`)
                socket.emit('set-player', 2)
                socket.join(roomId)

                // Create a room with a game state
                database.createGame(roomId)
                // Send game state to users
                io.to(roomId).emit('goto-game-screen', roomId)
            }
            else {
                socket.emit('message', `Failure, No such room: ${roomId}, exists`)
            }
        })

        // Called when both players have joined the game 
        socket.on('init-game', roomId => {
            socket.join(roomId)
            runGame(roomId)
        })

        // Called when player clicks on a cards 
        socket.on('player-action', client => {
            const data = JSON.parse(client)
            switch (data.action) {
                case 'play-card':
                    database.playerAction(data.roomId, data.action, { player: data.player, cardIndex: data.cardIndex })
                    break
                case 'lock-play':
                case 'lock-flip':
                case 'draw-card':
                    database.playerAction(data.roomId, data.action, { player: data.player })
                    break
                case 'next-phase':
                    database.playerAction(data.roomId, data.action, { phase: data.phase })
                    break
            }

            // Sending new data to players after player action
            runGame(data.roomId)
        })

        // When player leaves server.
        socket.on('disconnect', () => {
            // Handle player disconnection here
            // const roomId = getRoomIdFromSocket(socket); // Implement this function based on your room management
            // if (roomId) {
            //     // Handle player removal from room and cleanup
            //     database.removePlayerFromRoom(roomId, socket.id);
            // }
            io.emit('message', 'A player has disconnected.');
        })
    })

    // Function to send game state to users in room
    function runGame(roomId) {
        const game = database.getGameState(roomId)
        io.to(roomId).emit('run-game', JSON.stringify(game))

        // Checking if room game is over and deleting room
        if (game.winner !== null) {
            game.removeRoom(roomId)
        }
    }

    return io
}

module.exports = setupSocket