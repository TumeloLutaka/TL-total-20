const express = require('express')
const router = express.Router()

router.get('/', (req, res) => {
    res.render('index.ejs')
})

router.get('/game', (req, res) => {
    res.render('game.ejs')
})

module.exports = router