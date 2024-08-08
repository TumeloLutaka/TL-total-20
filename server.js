const path = require('path')
const http = require('http')
const express = require('express')
const setupSocket = require('./public/javascript/socketIO.js')

// Creating server
const app = express()
const server = http.createServer(app)
const io = setupSocket(server)

// Import routes
const indexRouter = require('./routes/index.js');

// Setting static folder
app.use(express.static(path.join(__dirname, 'public')));
app.use('/', indexRouter)

// Setting view engine to EJS
app.set('view engine', 'ejs'); // Set EJS as the view engine

const PORT = 3000 || process.env.PORT

server.listen(PORT, () => {
    console.log("Server is running on port: " + PORT)
})
