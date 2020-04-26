parseCookie = (cookie) => {
  try {
    let splitCookie = cookie.split('; ')
    let parsedCookie = {}
    let authToken = splitCookie.find(element => element.search('authToken') !== -1)
    parsedCookie.token = authToken.split('=')[1]
    let username = splitCookie.find(element => element.search('username') !== -1)
    parsedCookie.username = username.split('=')[1]
    return parsedCookie
  } catch {
    return 'ERROR_READING_COOKIE'
  }
}