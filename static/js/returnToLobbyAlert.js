function returnToLobbyAlert(alertText) {
    $.confirm({
      boxWidth: '90%',
      useBootstrap: false,
      title: alertText,
      content: 'You will return to the lobby in 10 seconds.',
      autoClose: 'OK|10000',
      buttons: {
        OK: {
        buttonWidth: 200,
        text: 'OK',
            action: function () {
              window.location.href = "/static/lobby.html"
            }
        },
      }
    })
  }