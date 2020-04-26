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
  $.confirm({
    boxWidth: '90%',
    useBootstrap: false,
    title: `You were challenged by ${username}`,
    content: 'You will return to the lobby in 10 seconds if you don\'t respond.',
    autoClose: 'Cancel|10000',
    buttons: {
      enterGame: {
      text: 'Accept',
          action: function () {
            socket.emit('challenge accepted')
            window.location.href = "/static/game.html"
          }
      },
      Cancel: function () {
        socket.emit('leave game')
        returnToLobbyAlert('You declined the challenge')
      }
    }
  })
})

socket.on('authentication error', () => {
    window.location.href = "/"
})

socket.on('in game', () => {
    window.location.href = "/static/game.html"
})

socket.emit('at lobby')