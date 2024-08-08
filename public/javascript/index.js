// Initializing socket.
const socket = io()
// Getting reference to form elements
const createGameForm = document.getElementById('create-game-form')
const joinGameForm = document.getElementById('join-game-form')
const toastContainer = document.getElementById('toast-container')

// TODO: Used for debugging, will be removed/commented out.
socket.on('message', data => {
    handleServerMessage(data)
})

// Server sends data to update list of open rooms on homepage.
socket.on('get-rooms', data => {
    // Check if there are rooms present in the array
    if(data.length > 0){
        // Show all rooms open at the point of user connecting to the server.
        const roomsList = document.querySelector(".rooms-list")
        // Clear all child elements
        roomsList.textContent = ""
        // run loop to populate list with children
        for(let i = 0; i < data.length; i++){
            let listItem = document.createElement('li')
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

createGameForm.addEventListener("submit", handleFormSubmit(createGameForm, "create-game"));
joinGameForm.addEventListener("submit", handleFormSubmit(joinGameForm, "join-game"));

function handleFormSubmit(form, eventType) {
    return function(event) {
        event.preventDefault();
        const value = form.elements[eventType].value.trim();
        if (value === '') {
            alert('Field is Empty');
        } else {
            form.elements[eventType].value = ''; // Clear the input field
            socket.emit(eventType, value);
        }
    };
}

function handleServerMessage(data) {
    toastContainer.textContent = data;
    toastContainer.classList.add('show-toast');
    setTimeout(() => {
        toastContainer.classList.remove('show-toast');
    }, 5000);
}