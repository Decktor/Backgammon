let emailError = getQueryVariable('emailError')
let passwordError = getQueryVariable('passwordError')
let nameError = getQueryVariable('usernameError')

const messageTemplate = document.querySelector('#error-template').innerHTML
const html = Mustache.render(messageTemplate, { 
    emailErrorMessage: emailError, 
    nameErrorMessage: nameError, 
    passwordErrorMessage: passwordError
})
document.querySelector('#error').insertAdjacentHTML('beforeend', html)