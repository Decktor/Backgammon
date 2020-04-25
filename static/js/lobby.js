let socket = io()

let scale = 1
let canvas = document.getElementById('board-canvas')
let ctx = canvas.getContext('2d')
let logoImg = new Image()
logoImg.src = './images/logo.png'
logoImg.onload = () => {
    drawLogo()
}

let playersInLobby = []

canvas.width = 1026
canvas.height = 864
resizeWindow()
window.addEventListener('resize', resizeWindow)

function drawLogo() {
    ctx.drawImage(logoImg, 0, 0)
}

function resizeWindow() {
    let scaleH = window.innerHeight / 864
    let scaleW = window.innerWidth / (1026 * 1.3)
    scale = scaleH < scaleW ? scaleH : scaleW
    if (scale > 1) {
      scale = 1
    }
    canvas.width = 1026
    canvas.height = 864
    ctx.scale(scale, scale)
    drawLogo()
}

function logOutClicked() {
    console.log('Log out clicked')
    let form = document.createElement('form')
    form.setAttribute('method', 'post')
    form.setAttribute('action', '/logout')
    form.style.display = 'hidden'
    document.body.appendChild(form)
    form.submit()
}  

const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML
socket.on('players in lobby', (playersInLobby) => {
    const html = Mustache.render(sidebarTemplate, {playersInLobby})
    document.querySelector('.sidebar').innerHTML = html
})

socket.on('new game prompt', (username) => {
  console.log('Challenged by', username)
  if (confirm(`You were challenged by ${username} Would you like to start the game?`)){
    window.location.href = "/static/game.html"
  } else {
      socket.emit('leave game')
  }
})

socket.on('authentication error', () => {
    window.location.href = "/"
})

socket.on('in game', () => {
    window.location.href = "/static/game.html"
})

socket.emit('at lobby')