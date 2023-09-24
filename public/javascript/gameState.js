const Deck = require('./deck')

const ROOMS  = [
    // {
    //     roomId: "tumelo",
    //     gameState: new GameState()
    // }
]

// Function that server calls to create a room
function createRoom(roomId) {
    // Pushing new room to array
    ROOMS.push({roomId: roomId})
}
    
// Create gameState for room with two players
function createGame(roomId) {
    const room = ROOMS.find( room => room.roomId === roomId)
    room.gameState = new GameState()
}

// Function get game state
function getGameState(roomId) {
    const room = ROOMS.find( room => room.roomId === roomId)
    return room.gameState
}
    
// Function that checks if a room with a partciular id has already been created
function roomExists(roomId) {
    const room = ROOMS.find( room => room.roomId === roomId )
    if(room) return true 
    else return false
}

function removeRoom(roomId) {
    // Checking if room exists
    const room = ROOMS.find( room => room.roomId === roomId )
    if(room){
        let index = ROOMS.indexOf(room)
        // Delete room using index
        ROOMS.splice(index, 1)
    }
}

// Function called to edit gameState based on specific player actions
function playerAction(roomId, action, data) {
    const room = ROOMS.find( room => room.roomId === roomId)
    // Get player based on number
    let player = data.player === '1' ? room.gameState.players.player1 : room.gameState.players.player2 
    let opponet = data.player === '1' ? room.gameState.players.player2 : room.gameState.players.player1 

    // Change points based on card 
    let card
    
    switch(action){
        case 'play-card':
            // Change points based on card 
            card = player.hand[data.cardIndex]
            player.playedIndex = data.cardIndex
            // Remove card from player hand
            // player.hand.splice(data.cardIndex, 1)
            room.gameState.phase = 'picking'
            //Change player points
            tabulatePoints(room, player, opponet, card)
            break;
        case 'draw-card':
            // Change points based on draw deck card 
            card = room.gameState.drawDeck.deck.cards[room.gameState.drawDeck.currentTopCard]
            // Put top deck card on player deckspace and increase currentTopCard counter
            room.gameState.phase = 'draw' 
            //Change player points
            tabulatePoints(room, player, opponet, card) 
            room.gameState.drawDeck.currentTopCard++  
            break; 
        case 'lock-play':
            // Set the player game state to locked to true
            lockPlayer(player, room)
            room.gameState.phase = 'draw' 
            // When player locks, check if other plyer is locked and calculate who the winner is based on points
            break;
        case 'lock-flip':
            // Switch play turn due to plyer being locked
            room.gameState.phase = 'playing' 
            changePlayerTurn(room)
            break;
        case 'next-phase':
            room.gameState.phase = data.phase
            break
    }
}

// Function change player points and check if player points are over 21
function tabulatePoints(room, player, opponent, card) {
    let multipler = card.type === 'red' ? -1 : 1
    player.points += (card.number * multipler)
    if(player.points < 0) player.points = 0

    // Check if player has hit exactly 20 points or above, if so lock them
    if(player.points === 20){
        lockPlayer(player, room)
    }
    // Check if player points exceed 20. If so, player has lost and opponent wins a point
    else if (player.points > 20) {
        // Round is overs and player has lost begin new round. Add point to player wins.
        let roundWinner = opponent 
        
        tabulateWinPoints(roundWinner, room)
    }
}

// Function to perform checks when player is locked.
function lockPlayer(player, room){
    // lock player
    player.isLocked = true

    //Check if both player locked
    if(room.gameState.players.player1.isLocked && room.gameState.players.player2.isLocked){
        //Check whose won based on points
        if(room.gameState.players.player1.points === room.gameState.players.player2.points){
            resetRound(room)
            return
        } else {
            let roundWinner = 
             room.gameState.players.player1.points > room.gameState.players.player2.points ? 
            room.gameState.players.player1 : room.gameState.players.player2

            // Add points to the round winner wins
            tabulateWinPoints(roundWinner, room)
            return
        }
    } 
    
}

// Function to determin round winner and rest for next round.
function tabulateWinPoints(roundWinner, room){
    // Add points to player wins
    roundWinner.wins++

    // Check if player has won the game.
    if(roundWinner.wins === 2){
        // Winner has been found and game has ended. 
        room.gameState.winner = roundWinner
    } else {
        // Resetting round to the draw phase for the next player.
        room.gameState.phase = 'draw' 
        resetRound(room)
        
        // Make loser of last round start first.
        if(roundWinner.canPlay)
            changePlayerTurn(room)

    }
}

// Function to change the current player turn
function changePlayerTurn(room){
    room.gameState.players.player1.canPlay = !room.gameState.players.player1.canPlay 
    room.gameState.players.player2.canPlay = !room.gameState.players.player2.canPlay 
}

function resetRound(room){
    room.gameState.players.player1.points = 0
    room.gameState.players.player1.deckSpaceTopCard = null
    room.gameState.players.player1.isLocked = false
    room.gameState.players.player2.points = 0
    room.gameState.players.player2.deckSpaceTopCard = null
    room.gameState.players.player2.isLocked = false
}

class GameState {
    constructor(){
    const deck1 = new Deck()
    const deck2 = new Deck()
    
    this.drawDeck = {
        deck: new Deck(true),
        currentTopCard: 0
    }
    this.phase = 'playing'
    this.players = {
        player1: {
            hand: this.drawFirstFive(deck1), 
            canPlay:true,
            isLocked:false,
            playedIndex: null,
            points: 0,
            wins: 0
        },
        player2: {
            hand: this.drawFirstFive(deck2),
            canPlay:false,
            isLocked:false,
            playedIndex: null,
            points: 0,
            wins: 0
        }
    }
    this.round = 1
    this.winner = null
}

// Draw five cards for player.
drawFirstFive(deck) {
    let hand = []

    for (let i = 0; i < 5; i++){
        hand.push(deck.cards[i])
    }

    return hand

}
}

module.exports = {
    createGame,
    createRoom,
    getGameState,
    playerAction,
    removeRoom,
    roomExists
}