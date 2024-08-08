const cards = []

class card {
    constructor({number, type}) {
        this.number = number
        this.type = type
        this.isPlayed = false
    }
}

module.exports = class Deck {
    constructor(drawDeck = false) {
        this.drawDeck = drawDeck
        this.cards = this.createDeck()
        this.cards = this.shuffleDeck()

    }

    createDeck() {

        let cards = []

        for (let i = 0; i < 10; i++) 
        {
            for (let j = 0; j < 4; j++){
                let type
                if(this.drawDeck)
                    type = 'green'
                else
                    type = j % 2 == 0 ? 'red' : 'blue'
                cards.push(new card({number:i + 1, type:type}))
            }
        }

        return cards
    }

    shuffleDeck() {
        
        let shuffledDeck = []

        const counter = this.cards.length
        let cardNum = this.cards.length

        
        // Run loop to randomly select cards and add them to the shuffled deck.
        for (let i = 0; i < counter; i++){
            let randomInt = this.getRandomInt(0, cardNum-1)
            shuffledDeck.push(this.cards[randomInt])

            // Remove card from cards array
            this.cards.splice(randomInt, 1)

            cardNum--
        }

        return shuffledDeck
    }
    
    getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
      }
      
}
