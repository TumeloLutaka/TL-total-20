// Getting reference to form elements
const createGameForm = document.getElementById('create-game-form')
const joinGameForm = document.getElementById('join-game-form')

// Creating socket information
const socket = io()

// Receving message from server to print to console.
socket.on('message', data => {
    console.log(data)
})

// Recieving room data from server to update the list
socket.on('update-rooms', data => {
    // Check if there are rooms present in the array
    if(data.length > 0){
        // Show all rooms open at the point of user connecting to the server.
        const roomsList = document.querySelector(".rooms-list")
        // Clear all child elements
        roomsList.innerHTML = ""
        // run loop to populate list with children
        for(let i = 0; i < data.length; i++){
            console.log(i)
            let listItem = document.createElement('li')
            // listItem.innerHTML = `<h1>Room: ${i}</h1>`
            listItem.innerHTML = `<p>${data[i].roomId}</p>`

            // Add event listener to room list item
            listItem.addEventListener('click', () => {
                // Join input to have the text clicked on.
                joinGameForm.elements["join-game"].value = data[i].roomId
            })
            
            roomsList.appendChild(listItem)
        }
    }    
})

socket.on('set-player', num => {
    sessionStorage.setItem('player', num)
})

socket.on('goto-game-screen', (roomId) => {
    localStorage.setItem('roomId', roomId)
    window.location.href = '/game';
})

// Called when user clicks the create button on Create Game form
createGameForm.addEventListener("submit", function(event) {
    event.preventDefault(); // Prevent the default form submission
    
    // Access form elements by their 'name' attribute
    const createGame = createGameForm.elements["create-game"].value.trim();
    // Get a reference to the checkbox element
    const checkbox = document.getElementById("myCheckbox");
    // Check if input was empty
    if(createGame === ''){
        alert('Field is Empty')
    } else {
        document.getElementById('create-game').value = ''
        socket.emit('create-game', createGame)
    }
    
});

// Called when user clicks the join button on Join Game form
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
