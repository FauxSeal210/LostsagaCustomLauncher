const ipc = require('electron').ipcRenderer

const btnLogin = document.getElementById('btnLogin')
const btnHomePage = document.getElementById('btnHomePage')

btnLogin.addEventListener('click', () => {
  const idBox = document.getElementById('idBox').value
  const pwBox = document.getElementById('pwBox').value
  const server = document.querySelector('input[type=radio]:checked').value
  const saveId = document.getElementById('saveId').checked
  const saveServer = document.getElementById('saveServer').checked
  ipc.send('login', { id: idBox, pw: pwBox, server: server, saveId: saveId, saveServer: saveServer })
})

btnHomePage.addEventListener('click', () => {
  const server = document.querySelector('input[type=radio]:checked').value
  ipc.send('homepage', { server: server })
})

document.onkeypress = function(event) {
  if (event.keyCode == 13) {
    btnLogin.click()
  }
}

console.log('renderer js attached')