const express = require('express')
const User = require('../models/user')
const router = new express.Router()
const parseCookie = require('../utils/parseCookie.js')

router.post('/signup', async (req, res) => {
    try {
        const user = new User(req.body)
        await user.save()
        let token = await user.generateAuthToken()
        res.cookie('authToken', token)
        res.cookie('username', user.name)
        res.redirect('./static/lobby.html')
    } catch(e) {
        let errorString = '?'
        if (e.errors) {
            if (e.errors.email){
                errorString += `emailError=${e.errors.email.message}&`
            }
            if (e.errors.password) {
                errorString += `passwordError=${e.errors.password.message}&`
            }
        }
        if (e.errmsg) {
            errorString += `usernameError=Username or email already taken`
        }
        res.redirect(`./static/signUp.html${errorString}`)
    }
  })

router.post('/login',async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password) 
        let token = await user.generateAuthToken()
        let cookie = { 'authToken': token, 'username': user.name }
        res.cookie('authToken', token)
        res.cookie('username', user.name)
        res.redirect('./static/lobby.html')
    } catch (e) {
        res.redirect('./static/index.html?error=Invalid username or password')
    }
})

router.post('/logout', async (req,res) => {
    try {
        let {username, token} = parseCookie(req.headers.cookie)
        currentToken = token
        let user = await User.verifyToken(username, currentToken)
        user.tokens = user.tokens.filter((token) => {
            return token.token !== currentToken
        })
        await user.save()
        res.redirect('/')
    } catch (e) {
        res.status(500).send()
    }
})   

module.exports = router