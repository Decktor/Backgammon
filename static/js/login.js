const socket = io()
let error = getQueryVariable('error')

const messageTemplate = document.querySelector('#message-template').innerHTML
const html = Mustache.render(messageTemplate, {
    message: error,
})
document.querySelector('#messages').insertAdjacentHTML('beforeend', html)

socket.on('back to lobby', () => {
    window.location.href = "/static/lobby.html"
  })

socket.emit('at index')