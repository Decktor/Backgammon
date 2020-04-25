let scale = 1
const socket = io()

const selectionRectangleCenters = [ 
  {x: 990 ,y: 637},  
  {x: 900, y: 637},
  {x: 834, y: 637},
  {x: 775, y: 637},
  {x: 711, y: 637},
  {x: 651, y: 637},
  {x: 591, y: 637},
  {x: 434, y: 637},
  {x: 368, y: 637},
  {x: 307, y: 637},
  {x: 243, y: 637},
  {x: 182, y: 637},
  {x: 113, y: 637},
  {x: 113, y: 222}, 
  {x: 177, y: 222}, 
  {x: 238, y: 222}, 
  {x: 302 ,y: 222}, 
  {x: 368 ,y: 222}, 
  {x: 434 ,y: 222}, 
  {x: 585 ,y: 222}, 
  {x: 644 ,y: 222}, 
  {x: 706 ,y: 222}, 
  {x: 770 ,y: 222}, 
  {x: 836 ,y: 222}, 
  {x: 900 ,y: 222},
  {x: 990 ,y: 222},
  {x: 514, y: 637},
  {x: 516, y: 222},
]

let pos1 = -1
let pos2 = -1

const boardCanvas = document.getElementById('board-canvas')
const sidebarCanvas = document.getElementById('sidebar-canvas')
boardCanvas.width = 1026
boardCanvas.height = 864
sidebarCanvas.height = 210
boardCanvas.addEventListener("click", handleMouseclick)

const boardContext = boardCanvas.getContext('2d')
const boardImg = new Image()
boardImg.src = './images/board.png'
boardImg.onload = () => socket.emit('start game')

const sideBarContext = sidebarCanvas.getContext('2d')

sideBarContext.fillStyle = 'white'
sideBarContext.font = "50px arial"
let firstDie = 0
let secondDie = 0
let soloGame = false
let startedGame = false

resizeWindow()
window.addEventListener('resize', resizeWindow)
let opponent = getQueryVariable('opponent')
if (opponent) {
  socket.emit('challenge', opponent)
}

socket.on('state', function(gameState) {
  opponent = getQueryVariable('opponent')
  if (opponent) {
    window.location.href = "/static/game.html"
  }
  startedGame = gameState.startedGame
  soloGame = gameState.users[0].username === gameState.users[1].username
  drawBoard(gameState.board)
  drawSidebar(gameState)
})

socket.on('authentication error', function(gameState) {
  window.location.href = "/"
})

socket.on('back to lobby', function() {
  console.log('back to lobby')
  window.location.href = "/static/lobby.html"
})
socket.on('opponent left', function() {
  alert('Your opponent has left the game')
  window.location.href = "/static/lobby.html"
})

socket.on('won', function() {
  alert('You won!')
  window.location.href = "/static/lobby.html"
})

socket.on('lost', function() {
  alert('You won!')
  window.location.href = "/static/lobby.html"
})

function drawSidebar(gameState) {
  sideBarContext.clearRect(0,0,sidebarCanvas.width, sidebarCanvas.height)
  sideBarContext.font = "30px arial"
  sideBarContext.fillStyle = 'darkGray'
  sideBarContext.fillText(`White: ${gameState.users[0].username}`,15,40)
  sideBarContext.fillStyle = 'red'
  sideBarContext.fillText(`Red: ${gameState.users[1].username}`,15,80)
  sideBarContext.fillStyle = gameState.isWhiteTurn ? 'white' : 'red'
  sideBarContext.font = "50px arial"
  sideBarContext.fillText(`${gameState.isWhiteTurn ? 'White' : 'Red'}'s turn`,15,140)
  
  adjustButtonState(gameState)
  drawDice(gameState)
} 

function adjustButtonState (gameState) {
  const {username} = parseCookie(document.cookie)
  const isCurrentUserWhite = gameState.users[0].username === username ? true : false
  const passButton = document.getElementById('pass')
  const undoButton = document.getElementById('undo')
  const rollButton = document.getElementById('roll')

  if (soloGame || isCurrentUserWhite === gameState.isWhiteTurn)
  {
    if (gameState.movesLeft === 0) {
      passButton.disabled = false
    } else {
      passButton.disabled = true
    } 
    if (gameState.movesMade !== 0) {
      undoButton.disabled = false
    } else {
      undoButton.disabled = true
    }
    if (gameState.rolledThisTurn) {
      rollButton.disabled = true
    } else {
      rollButton.disabled = false
    }
  } else {
    passButton.disabled = true
    undoButton.disabled = true
    rollButton.disabled = true
  }
}

function drawDice(gameState) {
  sideBarContext.fillStyle = 'white'
  if (gameState.movesLeft == 4) {
    sideBarContext.fillText(`${gameState.dice.first}    ${gameState.dice.second}    ${gameState.dice.first}    ${gameState.dice.second}`,10,200)
  } else if (gameState.movesLeft == 3){
    sideBarContext.fillText(`${gameState.dice.first}    ${gameState.dice.first}    ${gameState.dice.first}`,50,200)
  } else if (gameState.dice.first !== 0 && gameState.dice.second !== 0) {
    sideBarContext.fillText(`${gameState.dice.first}    ${gameState.dice.second}`,90,200)
  } else if (gameState.dice.first !== 0) {
    sideBarContext.fillText(`${gameState.dice.first}`,130,200)
  } else if (gameState.dice.second !== 0){
    sideBarContext.fillText(`${gameState.dice.second}`,140,200)
  }
}

function handleMouseclick(mouseEvent) {
  if (pos1 === -1) {
    pos1 = getCurrentRectangle(boardCanvas, mouseEvent)
    drawSelectionRectangle(pos1)
  } else {
    pos2 = getCurrentRectangle(boardCanvas, mouseEvent)
    socket.emit('movement', {pos1, pos2})
    pos2 = pos1 = -1
  }
}

function resizeWindow() {
  const scaleH = window.innerHeight / 864
  const scaleW = window.innerWidth / (1026 * 1.3)
  scale = scaleH < scaleW ? scaleH : scaleW
  if (scale > 1) {
    scale = 1
  }
  boardCanvas.width = 1026
  boardCanvas.height = 864
  boardContext.scale(scale, scale)
  socket.emit('refresh')
}

function drawBoard(board) {
  boardContext.drawImage(boardImg, 0, 0)
  board.forEach((place, j) => {
    boardContext.fillStyle = place.isWhite ? 'darkGray' : 'red'
    const direction = selectionRectangleCenters[j].y === selectionRectangleCenters[1].y ? 1 : -1
    const yOffset = direction * 132
    const yPieceOffset = direction * -51
    for (let i = 0; i < place.numOfPieces && i < 6; i++) {
      boardContext.beginPath()
      boardContext.arc(selectionRectangleCenters[j].x, selectionRectangleCenters[j].y + yOffset + yPieceOffset * i, 25, 0, 2 * Math.PI)
      boardContext.fill()
    }
    if (place.numOfPieces > 6)
    {
      boardContext.fillStyle = 'white'
      boardContext.font = "30px arial"
      boardContext.textAlign = "center"
      boardContext.textBaseline = "middle"
      boardContext.fillText(`+${place.numOfPieces-6}`, selectionRectangleCenters[j].x, selectionRectangleCenters[j].y + yOffset + yPieceOffset * 6)
    }
  })
}

function getCurrentRectangle(boardCanvas, evt) {
  const viewRect = boardCanvas.getBoundingClientRect()
  let value = -1

  const x = (evt.clientX - viewRect.left) / scale
  const y = (evt.clientY - viewRect.top) / scale
  selectionRectangleCenters.forEach((rectangle, i) => {
    if (x + 25 > rectangle.x && x - 25 < rectangle.x && y + 162 > rectangle.y && y - 162 < rectangle.y) {
      value = i
    }
  })
  return value
}
 
function drawSelectionRectangle(column) {
  let beginingX = 0 
  let beginingY = 0
  if (column < 28 && column >= 0) {
    beginingX = selectionRectangleCenters[column].x - 32
    beginingY = selectionRectangleCenters[column].y - 162
  } else {
    return
  }
  boardContext.strokeStyle = 'green'
  boardContext.lineWidth = "6"
  boardContext.beginPath()
  boardContext.rect(beginingX, beginingY, 64, 325)
  boardContext.stroke()
} 

function rollClicked() {
  socket.emit('roll')
}

function undoClicked() {
  socket.emit('undo')
}

function passClicked() {
  socket.emit('pass')
}

function loseClicked() {
  const confirmationText  = 'Are you sure you want to leave the game?'
  if (startedGame && !soloGame) {
    confirmationText += 'It will make you lose 600 points on the leaderboard'
  }
  if (confirm(confirmationText)) {
    socket.emit('leave game')
  }
}