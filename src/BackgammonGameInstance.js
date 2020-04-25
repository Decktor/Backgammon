class BackgammonGameInstance {
  constructor() {
    this.lastGameStates = []
    this.getUser = username => this.gameState.users.find(user => user.username === username)


    this.gameState = {
      board: [
        { numOfPieces: 0, isWhite: false }, //End position for red player
        { numOfPieces: 2, isWhite: true  }, //Red base
        { numOfPieces: 0, isWhite: false }, //Red base
        { numOfPieces: 0, isWhite: false }, //Red base
        { numOfPieces: 0, isWhite: false }, //Red base
        { numOfPieces: 0, isWhite: false }, //Red base
        { numOfPieces: 5, isWhite: false }, //Red base
        { numOfPieces: 0, isWhite: false },
        { numOfPieces: 3, isWhite: false },
        { numOfPieces: 0, isWhite: false },
        { numOfPieces: 0, isWhite: false },
        { numOfPieces: 0, isWhite: false },
        { numOfPieces: 5, isWhite: true  },
        { numOfPieces: 5, isWhite: false },
        { numOfPieces: 0, isWhite: false },
        { numOfPieces: 0, isWhite: false },
        { numOfPieces: 0, isWhite: false },
        { numOfPieces: 3, isWhite: true  },
        { numOfPieces: 0, isWhite: false },
        { numOfPieces: 5, isWhite: true  }, //White base
        { numOfPieces: 0, isWhite: false }, //White base
        { numOfPieces: 0, isWhite: false }, //White base
        { numOfPieces: 0, isWhite: false }, //White base
        { numOfPieces: 0, isWhite: false }, //White base
        { numOfPieces: 2, isWhite: false }, //White base
        { numOfPieces: 0, isWhite: true }, //End position for white player
        { numOfPieces: 0, isWhite: true },  //Jail position for white player
        { numOfPieces: 0, isWhite: false }, //Jail position for red player
      ],
      isWhiteTurn: true,
      dice: { first: 0, second: 0 },
      movesLeft: 2,
      movesMade: 0,
      rolledThisTurn: false,
      users: [],
      won: -1,
      score: 0,
      startedGame: false
    }

    this.copyGameState = function (current) {
      let copy = { board: [], dice: {} }
      current.board.forEach(element => {
        copy.board.push({ numOfPieces: element.numOfPieces, isWhite: element.isWhite })
      })
      copy.isWhiteTurn = current.isWhiteTurn
      copy.dice.first = current.dice.first
      copy.dice.second = current.dice.second
      copy.movesLeft = current.movesLeft
      copy.rolledThisTurn = current.rolledThisTurn
      copy.movesMade = current.movesMade
      copy.users = current.users
      copy.won = current.won
      return copy
    }
    
    this.addUser = ({username, isWhite}) => {
      const user = {username, isWhite}
      this.gameState.users.push(user)
      return user
    }

    this.addPlayers = function (whitePlayer, redPlayer) {
      if (this.gameState.users.length == 0) {
        this.addUser({username: whitePlayer.username, isWhite: true })
        this.addUser({username: redPlayer.username, isWhite: false })
      } 
    }


    this.isValidMove = function (pos1, pos2, direction, oldPos, newPos) {
      if (pos1 === pos2) 
        return false
      if (pos1 < 0 || pos2 < 0 || pos1 > 27 || pos2 > 25) 
        return false
      if (oldPos.numOfPieces === 0) 
        return false
      if (oldPos.isWhite !== this.gameState.isWhiteTurn) 
        return false
      if (pos1 < 25 && pos2 !== pos1 + this.gameState.dice.first * direction && pos2 !== pos1 + this.gameState.dice.second * direction && pos2 !== 25 && pos2 !== 0) 
        return false
      if (pos1 === 26 && pos2 !== this.gameState.dice.first && pos2 !== this.gameState.dice.second) 
        return false
      if (pos1 === 27 && pos2 !== 25 - this.gameState.dice.first && pos2 !== 25 - this.gameState.dice.second) 
        return false
      if (newPos.isWhite != oldPos.isWhite && newPos.numOfPieces > 1) 
        return false
      if (pos1 !== 26 && pos1 !== 27 && !this.isJailEmpty()) 
        return false
      if (pos1 === 25 || pos1 === 0) 
        return false
      if (this.gameState.movesLeft === 0) 
        return false
      return this.checkFinalGameStageMoves(pos1, pos2, direction)
    }

    this.checkFinalGameStageMoves = function(pos1, pos2, direction) {
      if (pos2 === 25 || pos2 === 0) {
        if (!this.isFinalGameStage()) {
          return false
        }
        if (pos1 + this.gameState.dice.first * direction !== pos2 && pos1 + this.gameState.dice.second * direction !== pos2) {
          if (Math.abs(pos2 - pos1) > this.gameState.dice.first && Math.abs(pos2 - pos1) > this.gameState.dice.second) {
            return false
          }
          else if (!this.isFurthestColumn(pos1)) {
            return false
          }
        }
      }
      return true
    }

    this.isFurthestColumn = function (pos1, die) {
      if (this.gameState.isWhiteTurn) {
        if (this.getFurthestPosition() < pos1) {
          return false
        }
      }
      else {
        if (this.getFurthestPosition() > pos1) {
          return false
        }
      }
      return true
    }

    this.isJailEmpty = function () {
      if (this.gameState.isWhiteTurn) {
        return this.gameState.board[26].numOfPieces > 0 ? false : true
      }
      else {
        return this.gameState.board[27].numOfPieces > 0 ? false : true
      }
    }

    this.isAnyMovePossible = function () {
      if (!this.gameState.rolledThisTurn) {
        return true
      }
      const direction = this.gameState.isWhiteTurn ? 1 : -1
      let result = false
      for (let i = 0; i < 28; i++) {
        for (let j = 0; j < 28; j++) {
          if (this.isValidMove(i, j, direction, this.gameState.board[i], this.gameState.board[j])) {
            result = true
          }
        }
      }
      if (result === false) {
        this.gameState.movesLeft = 0
      }
    }

    this.getFurthestPosition = function () {
      let start
      let finish
      let direction
      if (this.gameState.isWhiteTurn) {
        start = 19
        finish = 24
        direction = 1
      }
      else {
        start = 6
        finish = 1
        direction = -1
      }
      while (start !== finish) {
        if (this.gameState.board[start].numOfPieces > 0 && this.gameState.board[start].isWhite === this.gameState.isWhiteTurn) {
          return start
        }
        start += direction
      }
      return finish
    }

    this.makeMove = function (pos1, pos2, username) {
      if (this.getUser(username).isWhite === this.gameState.isWhiteTurn || this.gameState.users[0].username === this.gameState.users[1].username) {
        const direction = this.gameState.isWhiteTurn ? 1 : -1
        const oldPos = this.gameState.board[pos1]
        const newPos = this.gameState.board[pos2]
        const validMove = this.isValidMove(pos1, pos2, direction, oldPos, newPos)
        if (validMove) {
          this.lastGameStates.push(this.copyGameState(this.gameState))
          if (this.gameState.movesLeft < 3) {
            this.makeDieZero(pos1, direction, pos2)
          }
          if (newPos.isWhite != oldPos.isWhite && newPos.numOfPieces === 1) {
            newPos.numOfPieces = 0
            if (newPos.isWhite) {
              this.gameState.board[26].numOfPieces++
            }
            else {
              this.gameState.board[27].numOfPieces++
            }
          }
          oldPos.numOfPieces--
          newPos.numOfPieces++
          newPos.isWhite = oldPos.isWhite
          this.gameState.movesMade++
          this.gameState.movesLeft--
        }
      }
    }

    this.makeDieZero = function (pos1, direction, pos2) {
      let usedFirstDie = false
      if (this.gameState.dice.second === 0) {
        usedFirstDie = true
      }
      if ((pos1 + this.gameState.dice.first * direction === pos2 && pos2 < 26 && pos1 < 25)) {
        usedFirstDie = true
      }
      if (this.isFinalGameStage() && pos1 + this.gameState.dice.second !== pos2 && this.isFurthestColumn(pos1) && Math.abs(pos2 - pos1) < this.gameState.dice.first) {
        usedFirstDie = true
      }
      if (pos1 > 24 && (pos2 === this.gameState.dice.first)) {
        usedFirstDie = true
      }
      if (pos1 === 27 && pos2 === 25 - this.gameState.dice.first) {
        usedFirstDie = true
      }
      if (this.gameState.dice.first === 0) {
        usedFirstDie = false
      }
      if (usedFirstDie) {
        this.gameState.dice.first = 0
      }
      else {
        this.gameState.dice.second = 0
      }
    }

    this.roll = function (username) {
      {
        if (this.getUser(username).isWhite === this.gameState.isWhiteTurn || this.gameState.users[0].username === this.gameState.users[1].username) {
          this.gameState.startedGame = true
          if (!this.gameState.rolledThisTurn) {
            this.gameState.dice.first = Math.ceil(Math.random() * 6)
            this.gameState.dice.second = Math.ceil(Math.random() * 6)
            if (this.gameState.dice.first === this.gameState.dice.second) {
              this.gameState.movesLeft = 4
            }
            else {
              this.gameState.movesLeft = 2
            }
            this.gameState.rolledThisTurn = true
          }
        }
      }
    }

    this.pass = function (username) {
      if (this.getUser(username).isWhite === this.gameState.isWhiteTurn || this.gameState.users[0].username === this.gameState.users[1].username) {
        this.checkIfPlayerWon()
        if (this.gameState.movesLeft < 1) {
          this.gameState.isWhiteTurn = !this.gameState.isWhiteTurn
          this.gameState.dice.first = this.gameState.dice.second = 0
          this.lastGameStates = []
          this.gameState.movesLeft = 2
          this.gameState.rolledThisTurn = false
          this.gameState.movesMade = 0
        }
      }
    }

    this.undo = function (username) {
      if (this.getUser(username).isWhite === this.gameState.isWhiteTurn || this.gameState.users[0].username === this.gameState.users[1].username) {
        if (this.lastGameStates.length > 0) {
          this.gameState = this.lastGameStates.pop()
        }
      }
    }

    this.checkIfPlayerWon = function() {
      if (this.gameState.board[0].numOfPieces === 15 || this.gameState.board[25].numOfPieces === 15) {
        this.gameState.won = this.gameState.isWhiteTurn ? 0 : 1
        this.gameState.score = this.calculateScore()
      }
    }

    this.isFinalGameStage = function () {
      let start = 1
      let finish = 24
      if (this.gameState.isWhiteTurn) {
        finish = 18
      }
      else {
        start = 7
      }
      while (start <= finish) {
        if (this.gameState.board[start].numOfPieces > 0 && this.gameState.board[start].isWhite === this.gameState.isWhiteTurn) {
          return false
        }
        start++
      }
      return true
    }

    this.hasPiecesOnEnemyBase = function (playerIsWhite) {
      let start
      let finish
      if (playerIsWhite) {
        start = 1
        finish = 6
      }
      else {
        finish = 24
        start = 18
      }
      while (start <= finish) {
        if (this.gameState.board[start].numOfPieces > 0 && this.gameState.board[start].isWhite === playerIsWhite) {
          return true
        }
        start++
      }
      return false
    }

    this.calculateScore = function (){
      const losingPlayerOutPosition = this.gameState.won === 0 ? this.gameState.board[0] : this.gameState.board[25]
      const losingPlayerJail = this.gameState.won === 0 ? this.gameState.board[27] : this.gameState.board[26]
      const losingPlayerHasPiecesOnEnemyBase = this.hasPiecesOnEnemyBase(this.gameState.won === 0 ? true : false)

      console.log('Won', this.gameState.won, 'losing out position', losingPlayerOutPosition.numOfPieces, 'losing jail',losingPlayerJail, 'has pieces on enemy base' ,losingPlayerHasPiecesOnEnemyBase)

      if (losingPlayerOutPosition.numOfPieces > 0) {
        return 100
      }
      if (losingPlayerHasPiecesOnEnemyBase && losingPlayerJail.numOfPieces > 0) {
        return 500
      }
      if (losingPlayerJail.numOfPieces > 0) {
        return 400
      }
      if (losingPlayerHasPiecesOnEnemyBase) {
        return 300
      }
      return 200
    }

    this.getGameState = function () {
      return this.gameState
    }
  }
}

module.exports = BackgammonGameInstance