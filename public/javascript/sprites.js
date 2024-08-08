// Getting canvas and context
const canvas = document.querySelector('.game-screen')
const context = canvas.getContext('2d')

// Canvas variables
const CANVAS_WIDTH = 1024
const CANVAS_HEIGHT= 576
const padding = 50

// Setting canvas dimensions
canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;

// Card Variables
const CARD_WIDTH = 70
const CARD_HEIGHT= 100
const centerX = (CANVAS_WIDTH / 2) - (CARD_WIDTH / 2)

// Buttons
const BUTTON_WIDTH  = 140
const BUTTON_HEIGHT = 50

var FILL_STYLE = 'black'

class ImageSprite {
    constructor({position, size, imageSrc}) {
        this.position = position
        this.width = size.width
        this.height = size.height
        this.visibility = true

        this.image = new Image()
        this.image.src = imageSrc
    }

    draw() {
        // Checking if image should be shown.
        if(!this.visibility) return
        context.drawImage(this.image, this.position.x, this.position.y, this.width, this.height)
    }
}
class ImageTextSprite {
    constructor({position, size, imageSrc}) {
        this.position = position
        this.width = size.width
        this.height = size.height

        this.image = new Image()
        this.image.src = imageSrc
    }

    draw(text, color = "white") {
        context.drawImage(this.image, this.position.x, this.position.y, this.width, this.height)
        // Drawing text
        context.fillStyle = color
        context.font = '25px Arial'; 
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(text, this.position.x + (this.width / 2), this.position.y + (this.height / 2))
    }
}
class CardSprite{
    constructor({position, number, type, isPlayed}) {
        this.position = position
        this.width = CARD_WIDTH
        this.height = CARD_HEIGHT
        this.number = number
        this.type = type
        this.isPlayed = isPlayed
        this.currentImage
        
        this.image = new Image()
        this.image.src = `../img/cards/${type}/c${number}.png`
        this.backCardImg = new Image()
        this.backCardImg.src = `../img/cards/c.png`
        
        this.currentImage = this.image
        
        // move animation variables.
        this.topCard = null
    }    
    
    draw() {
        context.drawImage(this.currentImage, this.position.x, this.position.y, this.width, this.height)
    }
    updateCard(number = this.number, type = this.type) {
        this.number = number
        this.type = type
        let newImage = new Image()
        newImage.src = `../img/cards/${type}/c${number}.png`
        newImage.onload = () => {
            this.currentImage = newImage
        }
    }
    updateCardInfo(number = this.number, type = this.type) {
        this.number = number
        this.type = type
        let newImage = new Image()
        newImage.src = `../img/cards/${type}/c${number}.png`
        newImage.onload = () => {
            this.image = newImage 
        }
    }
}
class DeckSpaceSprite extends ImageSprite {
    constructor({position, size, imageSrc}) {
        super({
            position, 
            size,
            imageSrc
        })
        this.centerPosition = {
            x: this.position.x + (CARD_WIDTH / 2),
            y: this.position.y + (CARD_HEIGHT / 2)
        }
    }

    update(points, wins) {
        // Draw deck space
        this.draw()
        
        // Points text
        context.fillStyle = "white"
        context.font = "30px Arial";
        context.fillText(points, this.position.x + (this.width / 2), this.position.y - 10)
        
        // Drawing the win indicator icons
        for(let i = 0; i < wins; i++){
            winInd.position.x = this.position.x + 20 + ( 20 * i)
            winInd.position.y = this.position.y + 22
            winInd.draw()
        }
    }
}
class ButtonSprite extends ImageTextSprite {
    constructor({position, size, imageSrc, text}) {
        super({
            position,
            size,
            imageSrc
        })

        this.text = text
    }

    drawButton(color = "white") {
        this.draw(this.text, color)
    }
}

// Called to set up deck space spries.
function setUpDeckSpaces() {
    //Array to be returned
    let deckSpaces = []

    // Card sizing
    const dsWidth = 140
    const dsHeight = 200
    const deckSpace = 200

    // Center of the board
    let centerX = canvas.width / 2 - (dsWidth / 2)
    let centerY = canvas.height / 2 - (dsHeight / 2)

    // Drawing deck spaces
    const playerDeckSpace = new DeckSpaceSprite({
        position: {
            x: centerX - deckSpace, 
            y: centerY
        },
        size: {
            width: dsWidth,
            height: dsHeight
        },
        imageSrc: "../img/deck-space.png"
    })
    const opponetDeckSpace = new DeckSpaceSprite({
        position: {
            x: centerX + deckSpace, 
            y: centerY
        },
        size: {
            width: dsWidth,
            height: dsHeight
        },
        imageSrc: "../img/deck-space.png"
    })
    
    deckSpaces.push(playerDeckSpace)
    deckSpaces.push(opponetDeckSpace)

    return deckSpaces

}
// Called to set up button sprites
function setUpButtons(){
    const buttons = [
        new ButtonSprite({
            position: {
                x:padding, 
                y:440
            }, 
            size: {
                width: BUTTON_WIDTH, 
                height: BUTTON_HEIGHT
            }, 
            imageSrc:"../img/buttons.png",
            text: "Draw"
        }), 
        new ButtonSprite({
            position: {x:padding, y:500}, 
            size: {width: BUTTON_WIDTH, height: BUTTON_HEIGHT}, 
            imageSrc:"../img/buttons.png",
            text: "Lock"
        }),
        new ButtonSprite({
            position: {x:CANVAS_WIDTH - padding - BUTTON_WIDTH , y:500}, 
            size: {width: BUTTON_WIDTH, height: BUTTON_HEIGHT}, 
            imageSrc:"../img/buttons.png",
            text: "End Turn"
        })
    ]

    return buttons
}
 
// Initializing sprites for drawn elements
const deckSpaces = setUpDeckSpaces()
const buttons = setUpButtons()

// Initalizing draw deck visual
var drawDeckSprite = new ImageSprite({
    position:{
        x: canvas.width / 2 - (CARD_WIDTH / 2),
        y: canvas.height / 2 - (CARD_HEIGHT / 2)
    },
    size:{
        width: CARD_WIDTH,
        height: CARD_HEIGHT
    },
    imageSrc: '../img/cards/c.png'
})
var playerTopCardSprite = new ImageSprite({
    position:deckSpaces[0].centerPosition,
    size:{
        width: CARD_WIDTH,
        height: CARD_HEIGHT
    },
    imageSrc: '../img/cards/blue/c5.png'
})
playerTopCardSprite.visibility = false
var opponentTopCardSprite = new ImageSprite({
    position:deckSpaces[1].centerPosition,
    size:{
        width: CARD_WIDTH,
        height: CARD_HEIGHT
    },
    imageSrc: '../img/cards/red/c10.png'
})
opponentTopCardSprite.visibility = false

// Initailizing animation deck card 
var animDeckSprite = new CardSprite({
    position:{
        x: canvas.width / 2 - (CARD_WIDTH / 2),
        y: canvas.height / 2 - (CARD_HEIGHT / 2)
    },
    number:5,
    type: "green"
})
animDeckSprite.currentImage = animDeckSprite.backCardImg 

// Initailizing opponent animation deck card 
var opponentCardSprite = new CardSprite({
    position:{
        x: canvas.width / 2 - (CARD_WIDTH / 2),
        y: -10 - CARD_HEIGHT
    },
    number:5,
    type: "green"
})
opponentCardSprite.currentImage = opponentCardSprite.backCardImg 

// Initializing image sprite
const background = new ImageSprite({
    position:{
        x:0,
        y:0
    },
    size:{
        width:CANVAS_WIDTH,
        height:CANVAS_HEIGHT
    },
    imageSrc: "../img/woodbackground.jpg"
})
// Initializing round wiinInicator icon.
const winInd = new ImageSprite({
    position:{
        x:0,
        y:0
    },
    size:{
        width:20,
        height:20
    },
    imageSrc: "../img/star.png"
})
// Initializing player indicator.
const playerIndicator = new ImageTextSprite({
    position:{
        x:(CANVAS_WIDTH / 2) - 120,
        y:50
    },
    size:{
        width:240,
        height:100
    },
    imageSrc: "../img/player-indicator.png"
})
// Initializing player indicator.
const phaseIndicator = new ImageTextSprite({
    position:{
        x:(CANVAS_WIDTH / 2) - 60,
        y:130
    },
    size:{
        width:120,
        height:43
    },
    imageSrc: "../img/player-indicator.png"
})