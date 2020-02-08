const ipc = require('electron').ipcRenderer

const btnOk = document.getElementById('btnOk')

btnOk.addEventListener('click', () => {
  const text = document.getElementById('captcha').value
  ipc.send('captcha', { text: text })
})

console.log('captcha.js attached')