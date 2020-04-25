// const users = []

// const addUser = ({id, isWhite, username}) => {
//     const user = {id, isWhite,username}
//     users.push(user)
//     return { user }
// }

// const removeUser = (id) => {
//     console.log('Should remove', id)
//     const index = users.findIndex((user) => user.id === id)

//     if (index !== -1) {
//         return users.splice(index, 1)[0]
//         console.log('Removed')
//     }
// }

// const getUser = id => users.find(user => user.id === id)

// const getUsersInRoom = room => users.filter(user => user.room === room.toLowerCase())

// const getAllPlayers = () => users

// module.exports = {
//     addUser,
//     removeUser,
//     getUser,
//     getUsersInRoom,
//     getAllPlayers
// }