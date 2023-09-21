const socket = io()

// Declaring variables. 
var GAMESTATE = null
var PLAYER = null
var OPPONENT = null
var HAND

var CARDS = []
const BUTTONS = []


// Called when the game page is loaded, tells server to start sending gamestate in the run-game event
socket.emit('init-game', localStorage.getItem('roomId'))

socket.on('run-game', data => {
    const gameState = JSON.parse(data)

    GAMESTATE = gameState
    PLAYER = sessionStorage.getItem('player') === '1' ? GAMESTATE.players.player1 : GAMESTATE.players.player2
    OPPONENT = sessionStorage.getItem('player') === '1' ? GAMESTATE.players.player2 : GAMESTATE.players.player1
    HAND = PLAYER.hand

    if(GAMESTATE.winner !== null){
        // Display winner details.
        document.querySelector('.winner-text').innerText = PLAYER.wins === 2 ? 'You Won!' : 'You Lost'
        document.querySelector('.prompt').style.display = 'flex'

        localStorage.removeItem('roomId')
        sessionStorage.removeItem('player')

    }
})
paintGame()

// Function that draws board and allows players to interact with it
function paintGame() {
    requestAnimationFrame(paintGame)
    if(GAMESTATE === null) return

    // Drawing background
    background.draw()
   
    playerIndicator.draw(PLAYER.canPlay ? "Your Turn" : "Opponent's Turn")
    phaseIndictor.draw(GAMESTATE.phase) 
    
    // Draw deckspaces
    deckSpaces[0].update(PLAYER.deckSpaceTopCard, PLAYER.points, PLAYER.wins)
    deckSpaces[1].update(OPPONENT.deckSpaceTopCard, OPPONENT.points, OPPONENT.wins)
    
    // Paint draw deck with top card.
    drawDeckSprite.updateCard(GAMESTATE.drawDeck.deck.cards[GAMESTATE.drawDeck.currentTopCard].number)
    drawDeckSprite.draw() 
    
    // Draw and add event listeners to buttons
    if(BUTTONS.length < 1){
        buttons.forEach( btn => {
            BUTTONS.push(btn)
            canvas.addEventListener('click', (event) => {
                if(PLAYER.canPlay){
                    
                    var rect = canvas.getBoundingClientRect(); 
                    var mouseX = event.clientX - rect.left;
                    var mouseY = event.clientY - rect.top;
        
                    if (mouseX >= btn.position.x && mouseX <= btn.position.x + btn.width && 
                        mouseY >= btn.position.y && mouseY <= btn.position.y + btn.height) { 
        
                        //Draw button  
                        if(btn.text === 'Draw'){
                            drawDeckSprite.animate = "turn"
                            console.log(drawDeckSprite.animate)
                        }
                        //Lock button
                        else if(btn.text === 'Lock' && (GAMESTATE.phase === 'play' || GAMESTATE.phase === 'done')) {
                            if(PLAYER.isLocked) return

                            // Lock player's gamestate instance
                            PLAYER.isLocked = true
    
                            // Telling server to set the player's isLocked variable to true
                            GAMESTATE.phase = 'Locking'
                            socket.emit('player-action', JSON.stringify({
                                roomId: localStorage.getItem('roomId'), 
                                action: 'lock-play', 
                                player: sessionStorage.getItem('player'),
                            }))
                        }
                        //End turn button
                        else if(btn.text === 'End Turn' && (GAMESTATE.phase === 'play' || GAMESTATE.phase === 'done')) {
                            // Telling server to set the player's isLocked variable to true
                            GAMESTATE.phase = 'Ending Turn'
                            socket.emit('player-action', JSON.stringify({
                                roomId: localStorage.getItem('roomId'), 
                                action: 'lock-flip', 
                                player: sessionStorage.getItem('player'),
                            }))
                        }
                    }
                }
            })
        })
    }

    // Draw player hand.
    if(CARDS.length < 1 || CARDS.length !== PLAYER.hand.length){
        // Empty hand
        CARDS = []
        // Add cards sprites to hand.
        for(let i = 0; i < HAND.length; i++) {
            let card = HAND[i]
            let newCard = new CardSprite({
                position:{
                    x: centerX + (CARD_WIDTH * ((i - 2) * 1.6)), 
                    y: canvas.height - (CARD_HEIGHT + 10)
                },
                number:card.number,
                type:card.type
            })
            CARDS.push(newCard)
    
            // Adding event listener to the card positions
            canvas.addEventListener('click', (event) => {
                if(PLAYER.canPlay === true && GAMESTATE.phase === 'play' && !PLAYER.isLocked) {
                    
                    var rect = canvas.getBoundingClientRect();
                    var mouseX = event.clientX - rect.left;
                    var mouseY = event.clientY - rect.top;
                    
                    // Check if mouse position was over card
                    if (mouseX >= newCard.position.x && mouseX <= newCard.position.x + CARD_WIDTH && 
                        mouseY >= newCard.position.y && mouseY <= newCard.position.y + CARD_HEIGHT) {
    
                        //Check if player points are game ending
                        GAMESTATE.phase = 'playing'
                        socket.emit('player-action', JSON.stringify({
                            roomId: localStorage.getItem('roomId'), 
                            action: 'play-card', 
                            player: sessionStorage.getItem('player'), 
                            cardIndex:i
                        }))
    
                    }
                }
            })
        }
    }
    
    BUTTONS.forEach(btn =>  {
        let color = "white"
        //Check if button is lock button
        if(btn.text === "Lock"){
            //Check if player is locked.
            if(PLAYER.isLocked){
                color = "blue"
            }
        }
        
        btn.drawButton(color)
    })
    CARDS.forEach(card =>  card.draw())

    // Round functionality

    // If game is over do not perform any round functionality
    if(GAMESTATE.winner !== null) return 

    if( PLAYER.canPlay === true && GAMESTATE.phase === 'draw'){
        
        // Check if player is locked
        if(PLAYER.isLocked){
            console.log("You are locked, Switching players")
            GAMESTATE.phase = "Switching"
            // Tell server to switch players
            socket.emit('player-action', JSON.stringify({
                roomId: localStorage.getItem('roomId'), 
                action: 'lock-flip', 
                player: sessionStorage.getItem('player')
            }))
        } else {
            console.log("You are not locked, Drawing")
            // Draw card and play as normal
            GAMESTATE.phase = 'null'
            // Call server to draw card and place it on top
            socket.emit('player-action', JSON.stringify({
                roomId: localStorage.getItem('roomId'), 
                action: 'draw-card', 
                player: sessionStorage.getItem('player')
            }))
        }
    }

}

document.getElementById('lobby-btn').addEventListener('click', () => {
    // Emit message to have the server end the game
    window.location.href = '/';
})  