const socket = io()
// socket.on('connect', () => {
//     console.log(socket.id)
// })
socket.on('greeting', data => {
    console.log(data)
})

socket.on('set-player', num => {
    sessionStorage.setItem('player', num)
})

socket.on('goto-game-screen', (roomId) => {
    localStorage.setItem('roomId', roomId)
    window.location.href = '/game';
})

const createGameForm = document.getElementById('create-game-form')
const joinGameForm = document.getElementById('join-game-form')

createGameForm.addEventListener("submit", function(event) {
    event.preventDefault(); // Prevent the default form submission
    
    // Access form elements by their 'name' attribute
    const createGame = createGameForm.elements["create-game"].value.trim();

    // Check if input was empty
    if(createGame === ''){
        alert('Field is Empty')
    } else {
        document.getElementById('create-game').value = ''
        socket.emit('create-game', createGame)
    }
    
});

joinGameForm.addEventListener("submit", function(event) {
    event.preventDefault(); // Prevent the default form submission
    
    // Access form elements by their 'name' attribute
    const joinGame = joinGameForm.elements["join-game"].value.trim();

    // Check if input was empty
    if(joinGame === ''){
        alert('Field is Empty')
    } else {
        document.getElementById('join-game').value = ''
        socket.emit('join-game', joinGame)
    }
    
});
