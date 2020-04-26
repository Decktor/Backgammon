const express = require('express')
const http = require('http')
const path = require('path')
const socketIO = require('socket.io')
const userRouter = require('./routers/user')

const app = express()
const server = http.Server(app)
const io = socketIO(server)
const GameInstance = require('./BackgammonGameInstance')
const parseCookie = require('./utils/parseCookie.js')
require('./db/mongoose')

const port = process.env.PORT
const User = require('./models/user')

let playersInServer = []
let currentGames = []
let gameInstance

app.set('port', port)
const publicDirectoryPath = path.join(__dirname, '../static')
app.use(express.urlencoded({extended: true}))

app.use('/static', express.static(publicDirectoryPath))
app.use(userRouter)


app.get('/', (request, response) => {
  response.redirect('./static/index.html')
})


server.listen(port, () => {
  console.log('Starting server on port ' + port)
})

isPlayerInThisInstance = (username) => {
  if (!gameInstance)
    return false
  if (username === gameInstance.getGameState().users[0].username || username === gameInstance.getGameState().users[1].username){
    return true
  }
  return false
}

checkIfPlayerWon = () => {
  const won = gameInstance.getGameState().won
  if (won !== -1) {
    const lost = (won + 1) % 2
    const wonName = gameInstance.getGameState().users[won].username
    const lostName = gameInstance.getGameState().users[lost].username
    if (wonName !== lostName) {
      const score = gameInstance.getGameState().score
      updatePlayerScore(wonName, score)
      updatePlayerScore(lostName, -score)
    }
    closeGame(wonName)
  }
}

updatePlayerScore = async (playerName, score) => {
  const player = playersInServer.filter(element => element.username === playerName)[0]
  await User.updateRank(player.username, player.token, score)
}

refreshClient = () => {
  if (gameInstance) {
    gameInstance.isAnyMovePossible()
    for (let player = 0; player < playersInServer.length; player++) {
      if (isPlayerInThisInstance(playersInServer[player].username, gameInstance)){
        for (let socketNum = 0; socketNum < playersInServer[player].sockets.length; socketNum++){
          io.to(`${playersInServer[player].sockets[socketNum]}`).emit('state', gameInstance.getGameState())
        }
      }
    }
  }
  let playersInLobby = []
  playersInServer.forEach(element => playersInLobby.push({username: element.username, rank: element.rank}))
  playersInLobby = playersInServer.filter(element => !element.inGame)
  playersInLobby.sort((a,b) => {
    if (a.username < b.username) {
      return -1
    } if (a.username > b.username) {
      return 1
    } 
    return 0
  })

  io.to('lobby').emit('players in lobby', playersInLobby)
}

findCurrentGame = (username) => {
  for (let i = 0; i < currentGames.length; i++) {
    if (currentGames[i].getGameState().users[0].username === username || currentGames[i].getGameState().users[1].username === username) {
      return currentGames[i]
    }
  }
  return undefined
}

findPlayerByUsername = (username) => {
  return playersInServer.find(element => element.username === username)
}

isPlayerInGame = (username) => {
  const existingPlayer = findPlayerByUsername(username)
  if (!existingPlayer || !existingPlayer.inGame) {
    return false
  }
  return true
}

closeGame = (username) => {
  let playerOne = findPlayerByUsername(gameInstance.getGameState().users[0].username)
  let playerTwo = findPlayerByUsername(gameInstance.getGameState().users[1].username)
  const currentPlayer = playerOne.username === username ? playerOne : playerTwo
  const otherPlayer = playerOne.username === username ? playerTwo : playerOne
  const currentPlayerMesssage = gameInstance.getGameState().won === -1 ? 'back to lobby' : 'won'
  const otherPlayerMesssage = gameInstance.getGameState().won === -1 ? 'opponent left' : 'lost'

  playerOne.inGame = playerTwo.inGame = false
  currentGames = currentGames.filter(element => element !== gameInstance)
  currentPlayer.sockets.forEach(playerOneSocket => { io.to(`${playerOneSocket}`).emit(currentPlayerMesssage) })
  if (playerTwo !== playerOne) {
    otherPlayer.sockets.forEach(playerTwoSocket => { io.to(`${playerTwoSocket}`).emit(otherPlayerMesssage) })
  }
}

addplayer = (user, socket, token) => {
  let newPlayer = {'username': user.name, sockets: []}
  newPlayer.inGame = false
  newPlayer.sockets.push(socket.id)
  newPlayer.rank = user.rank
  newPlayer.token = token
  playersInServer.push(newPlayer)
}

io.on('connection', async (socket) => {

  socket.use(async (packet, next) => {  
    try {
      const {username, token} = parseCookie(socket.handshake.headers.cookie)
      const user = await User.verifyToken(username, token)
      if (!user) {
        throw new Error('Authentication error')
      }
      gameInstance = findCurrentGame(username)

      const existingPlayer = findPlayerByUsername(username)
      if (!existingPlayer){
        addplayer(user, socket, token)
      } else {
        const existingSocket = existingPlayer.sockets.find(element => element === socket.id)
        if (!existingSocket) {
          existingPlayer.sockets.push(socket.id)
        }
        existingPlayer.rank = user.rank
      }
      next()
    } catch (e){
      socket.emit('authentication error')
      socket.disconnect(true)
    }
  })

  socket.on('new player', () => {
    refreshClient()
  })

  socket.on('challenge accepted', () => {
    gameInstance.getGameState().startedGame = true
  }) 

  socket.on('at lobby', () => {
    const {username} = parseCookie(socket.handshake.headers.cookie)
    const existingPlayer = findPlayerByUsername(username)
    if (existingPlayer.inGame) {
      socket.emit('in game')
    }
    socket.join('lobby')
    refreshClient()
  })

  socket.on('movement', ({pos1, pos2}) => {
    const {username} = parseCookie(socket.handshake.headers.cookie)
    if (isPlayerInGame(username)) {
      gameInstance.makeMove(pos1, pos2, username)
    } else {
      socket.emit('back to lobby')
    }
    refreshClient()
  })

  socket.on('refresh', () => {
    refreshClient()
  })

  socket.on('disconnect', () => {
    const {username} = parseCookie(socket.handshake.headers.cookie)
    player = findPlayerByUsername(username)
    if (player) {
      player.sockets = player.sockets.filter(element => element !== socket.id)
      if (player.sockets.length === 0 && !player.inGame) {
        playersInServer = playersInServer.filter(element => element.username !== username)
      }
    }
  })

  socket.on('roll', () => {
    const {username} = parseCookie(socket.handshake.headers.cookie)
    if (isPlayerInGame(username)) {
      gameInstance.roll(username)
    } else {
      socket.emit('back to lobby')
    }
    socket.emit('rolled')
    refreshClient()
  })

  socket.on('pass', () => {
    const {username} = parseCookie(socket.handshake.headers.cookie)
    if (isPlayerInGame(username)) {
      gameInstance.pass(username)
      checkIfPlayerWon()
    } else {
      socket.emit('back to lobby')
    }
    refreshClient()
  })

  socket.on('undo', () => {
    const {username} = parseCookie(socket.handshake.headers.cookie)
    if (isPlayerInGame(username)) {
      gameInstance.undo(username)
    } else {
      socket.emit('back to lobby')
    }
    refreshClient()
  })

  socket.on('start game', () => {
    const {username} = parseCookie(socket.handshake.headers.cookie)
    if (!isPlayerInGame(username)) {
      socket.emit('back to lobby')
    }
    refreshClient()
  })

  socket.on('at index', () => {
    socket.emit('back to lobby')
  })

  socket.on('leave game', () => {
    const {username} = parseCookie(socket.handshake.headers.cookie)
    if (!isPlayerInGame(username)) {
      socket.emit('back to lobby')
    } else {
      if (gameInstance.getGameState().startedGame && gameInstance.getGameState().users[0].username !== gameInstance.getGameState().users[1].username){
        updatePlayerScore(username, -600)
      }
      closeGame(username)
    }
  })

  socket.on('challenge', (opponent) => {
    const {username} = parseCookie(socket.handshake.headers.cookie)
    playerOne = findPlayerByUsername(username)
    playerTwo = findPlayerByUsername(opponent)
    if (!playerTwo) {
      socket.emit('back to lobby')
    } else if (playerOne.inGame !== true && playerTwo.inGame !== true) {
      if (playerTwo !== playerOne) {
        playerTwo.sockets.forEach(playerTwoSocket => { io.to(`${playerTwoSocket}`).emit('new game prompt', playerOne.username) })
      }
      let redPlayer
      let whitePlayer
      if (Math.random() > .5){
        redPlayer = playerOne
        whitePlayer = playerTwo
      } else {
        whitePlayer = playerOne
        redPlayer = playerTwo
      }
      playerTwo.inGame = playerOne.inGame = true
      let newGameInstance = new GameInstance()
      newGameInstance.addPlayers(whitePlayer, redPlayer)
      currentGames.push(newGameInstance)
    }
  })
})