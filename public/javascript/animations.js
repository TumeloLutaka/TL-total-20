// Called to move the card from the draw deck.
function animMoveCard(card, topCard, position, animation, phase){
    // Check if new position and current position are the same
    if(card.newPosition.x === card.position.x && card.newPosition.y === card.position.y){
        checkMoveDone(card, topCard, position)
        
        // Check which player is calling the move turn animation.
        if(animation !== "draw-card") return
        
        // Tell server to switch players
        socket.emit('player-action', JSON.stringify({
            roomId: localStorage.getItem('roomId'), 
            action: 'next-phase', 
            phase:phase
        }))
        
    } else{
        move(card)  
    }
}

function animTurnCard(card, cardWidth){
    //Checking if card has reach the middle of the animation and if sprite needs to be changed.
    if(card.width <= 0) {
        card.currentImage = card.currentImage === card.backCardImg ? card.image  : card.backCardImg 
        card.multipler = 1
    }

    card.width += 3 * card.multipler
    card.position.x += -1.5 * card.multipler

    // Check if card has reached required with meaning animation has ended.
    if(card.width === cardWidth) {
        card.animate = ""
        setTimeout(() => {card.animate = "draw-card"}, 500)
    }
}

// utilities
function checkMoveDone(card, topCard, position) {
    let disappear = card.animate === "move-card" ? true : false
    card.animate = ""

    // make top card of deckspace visible.
    let newImage = new Image()
    newImage.src = `../img/cards/${card.type}/c${card.number}.png`
    newImage.onload = () => {
        topCard.image = newImage 
        topCard.visibility = true
        
        // make card invisible and return anim card to center.
        if(disappear) position = {x: -1000, y: -1000}
        card.position = position
        card.currentImage = card.backCardImg 
    }
}
function move(card){
    // Declaring variables used to move card to new position
    let xMove = 0;
    let yMove = 0;

    // Calculate the difference between current position and target position
    let xDiff = card.newPosition.x - card.position.x;
    let yDiff = card.newPosition.y - card.position.y;

    // Check if x or y need to be moved.
    if (xDiff !== 0) {
        // Calculate the absolute distance to move in x direction
        xMove = Math.abs(xDiff) < card.speed ? xDiff : (xDiff > 0 ? card.speed : -card.speed);
    }

    if (yDiff !== 0) {
        // Calculate the absolute distance to move in y direction
        yMove = Math.abs(yDiff) < card.speed ? yDiff : (yDiff > 0 ? card.speed * 1.8 : -card.speed * 1.8);
    }

    card.position.x += xMove
    card.position.y += yMove
}