const Game = (() => {
    let GAMESTATE = null;
    let PLAYER = null;
    let OPPONENT = null;
    let HAND;
    let CARDS = [];
    const BUTTONS = [];

    const socket = io();

    // Initialization and Event Handlers
    function init() {
        socket.emit('init-game', localStorage.getItem('roomId'));
        socket.on('run-game', handleRunGame);
        paintGame();
        document.getElementById('lobby-btn').addEventListener('click', () => window.location.href = '/');
    }

    // Function that draws board and allows players to interact with it
    function paintGame() {
        requestAnimationFrame(paintGame)
        if (GAMESTATE === null) return

        drawBoard();
        drawButtons();
        drawCards();

        // Round functionality
        // If game is over do not perform any round functionality
        if (GAMESTATE.winner !== null) return

        // Checking if it's current player's turn and they're locked.
        if (PLAYER.canPlay === true && GAMESTATE.phase === 'playing') {
            // Check if player is locked
            if (PLAYER.isLocked) {
                console.log("You are locked, Switching players")
                GAMESTATE.phase = "Switching"
                // Tell server to switch players
                socket.emit('player-action', JSON.stringify({
                    roomId: localStorage.getItem('roomId'),
                    action: 'lock-flip',
                    player: sessionStorage.getItem('player')
                }))
            }
        }

        if (GAMESTATE.phase === "draw") {
            // Move draw deck animation card.
            let deckIndex = PLAYER.canPlay ? 0 : 1
            let topCard = PLAYER.canPlay ? playerTopCardSprite : opponentTopCardSprite
            animDeckSprite.updateCardInfo(GAMESTATE.drawDeck.deck.cards[GAMESTATE.drawDeck.currentTopCard - 1].number)

            GAMESTATE.phase = "drawing"
        }

        if (GAMESTATE.phase === "picking") {
            // Check if moving player or opponent card.
            if (PLAYER.canPlay) {
            }
            else {
            }

            GAMESTATE.phase = "done"
        }
    }

    // OTHER FUNCTIONS
    // Other functions, including button click handling and card drawing
    function handleRunGame(data) {
        const gameState = JSON.parse(data)

        GAMESTATE = gameState
        PLAYER = sessionStorage.getItem('player') === '1' ? GAMESTATE.players.player1 : GAMESTATE.players.player2
        OPPONENT = sessionStorage.getItem('player') === '1' ? GAMESTATE.players.player2 : GAMESTATE.players.player1
        HAND = PLAYER.hand

        if (GAMESTATE.winner !== null) {
            // Display winner details.
            document.querySelector('.winner-text').innerText = PLAYER.wins === 2 ? 'You Won!' : 'You Lost'
            document.querySelector('.prompt').style.display = 'flex'

            localStorage.removeItem('roomId')
            sessionStorage.removeItem('player')
        }

        //Handle player hand
        handlePlayerHand()

        // Set up event listeners for canvas
        canvas.addEventListener('click', handleCanvasClick)
    }

    function handlePlayerHand() {
        // Empty hand
        CARDS = []
        // Add cards sprites to hand.
        for (let i = 0; i < HAND.length; i++) {
            let card = HAND[i]
            let newCard = new CardSprite({
                position: {
                    x: centerX + (CARD_WIDTH * ((i - 2) * 1.6)),
                    y: canvas.height - (CARD_HEIGHT + 10)
                },
                number: card.number,
                type: card.type,
                isPlayed: card.isPlayed
            })
            CARDS.push(newCard)
        }
    }

    function handleCanvasClick(event) {
        //Check if it's players turn to play.
        if (PLAYER.canPlay) {
            // Checking if a button has been clicked.
            buttons.forEach(btn => {
                if (isMouseOver(event, btn, 'btn')) {
                    handleButtonClick(btn);
                }
            })

            // Checking if a button has been clicked?
            if (GAMESTATE.phase === 'play' && !PLAYER.isLocked) {
                CARDS.forEach((card, i) => {
                    if (!card.isPlayed && isMouseOver(event, card, 'card')) {
                        handleCardClick(i);
                    }
                });
            }
        }
    }

    // Function to handle button clicks on canvas
    function handleButtonClick(btn) {
        //Draw button  
        if (btn.text === 'Draw') {
            GAMESTATE.phase = "drawing"
            // Call server to draw card and place it on top
            socket.emit('player-action', JSON.stringify({
                roomId: localStorage.getItem('roomId'),
                action: 'draw-card',
                player: sessionStorage.getItem('player')
            }))
        }
        //Lock button
        else if (btn.text === 'Lock' && (GAMESTATE.phase === 'play' || GAMESTATE.phase === 'done')) {
            if (PLAYER.isLocked) return

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
        else if (btn.text === 'End Turn' && (GAMESTATE.phase === 'play' || GAMESTATE.phase === 'done')) {
            // Telling server to set the player's isLocked variable to true
            GAMESTATE.phase = 'Ending Turn'
            socket.emit('player-action', JSON.stringify({
                roomId: localStorage.getItem('roomId'),
                action: 'lock-flip',
                player: sessionStorage.getItem('player'),
            }))
        }
    }

    function handleCardClick(i) {
        //Check if player points are game ending
        GAMESTATE.phase = 'wait'
        socket.emit('player-action', JSON.stringify({
            roomId: localStorage.getItem('roomId'),
            action: 'play-card',
            player: sessionStorage.getItem('player'),
            cardIndex: i
        }))
    }

    function drawBoard() {
        // Drawing background
        background.draw()

        playerIndicator.draw(PLAYER.canPlay ? "Your Turn" : "Opponent's Turn")
        phaseIndicator.draw(GAMESTATE.phase)

        // Draw deckspaces
        deckSpaces[0].update(PLAYER.points, PLAYER.wins)
        deckSpaces[1].update(OPPONENT.points, OPPONENT.wins)

        // Draw cards that will have animations on them.
        drawDeckSprite.draw()
        playerTopCardSprite.draw()
        opponentTopCardSprite.draw()
        animDeckSprite.draw()
        opponentCardSprite.draw()
    }
    function drawButtons() {
        buttons.forEach(btn => {
            let color = "white"
            //Check if button is lock button
            if (btn.text === "Lock") {
                //Check if player is locked.
                if (PLAYER.isLocked) {
                    color = "blue"
                }
            }

            btn.drawButton(color)
        })
    }
    function drawCards() {
        CARDS.forEach(card => {
            if (!card.isPlayed) { card.draw() }
        })

    }

    function isMouseOver(event, obj, objType) {
        var rect = canvas.getBoundingClientRect();
        const mousePosX = event.clientX - rect.left;
        const mousePosY = event.clientY - rect.top

        switch (objType) {
            case 'btn':
                return mousePosX >= obj.position.x && mousePosX <= obj.position.x + obj.width &&
                    mousePosY >= obj.position.y && mousePosY <= obj.position.y + obj.height;
            case 'card':
                return mousePosX >= obj.position.x && mousePosX <= obj.position.x + CARD_WIDTH &&
                    mousePosY >= obj.position.y && mousePosY <= obj.position.y + CARD_HEIGHT;
            default:
                return;
        }
    }

    return { init, socket };
})();

Game.init();