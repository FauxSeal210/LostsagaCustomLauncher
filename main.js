const { app, ipcMain, BrowserWindow } = require('electron')

const { spawn } = require('child_process')
const { autoUpdater } = require('electron-updater')
const fs = require('fs')
const os = require('os')
const path = require('path')

let win, parser, captcha

const dataPath = path.join(os.homedir(), 'LostsagaCustomLauncher/')

if (!fs.existsSync(dataPath)) {
  fs.mkdirSync(dataPath)
}

console.log(dataPath)

autoUpdater.checkForUpdatesAndNotify()

function createWindow() {
  win = new BrowserWindow({ title: '로스트사가 런쳐', width: 450, height: 350, webPreferences: { nodeIntegration: true }, resizable: false })
  win.setMenuBarVisibility(false)

  win.on('closed', () => app.quit())

  win.loadFile('index.html')

  loadId()
  loadServer()
}

function login(data) {
  parser = new BrowserWindow({ show: false, webPreferences: { webSecurity: false } })

  parser.webContents.on('did-finish-load', () => {

    /**
     * Nexon
     */
    if (parser.webContents.getURL() == 'https://nxlogin.nexon.com/common/login.aspx?redirect=http%3A%2F%2Flostsaga.nexon.com%2Fmain%2Fmain.asp') {
        parser.webContents.executeJavaScript(`document.getElementById('txtNexonID').value = '${data.id}'`)
        parser.webContents.executeJavaScript(`document.getElementById('txtPWD').value = '${data.pw}'`)
        parser.webContents.executeJavaScript(`document.getElementById('btnLogin').click()`)
    }

    if (parser.webContents.getURL() == 'http://lostsaga.nexon.com/main/main.asp') {
      parser.webContents.executeJavaScript(`GameStart()`)
    }

    if (parser.webContents.getURL() == 'http://lostsaga.nexon.com/play/playUrl.asp') {
      parser.webContents.executeJavaScript(`document.getElementById('playgame').href`, (playURL) => {
        startGame(playURL)
      })
    }
    ///////////////////////////////////////////////////////////////////////////////////////////////

    /**
     * Naver
     */
    if (parser.webContents.getURL() == 'https://nid.naver.com/nidlogin.login?url=http%3A%2F%2Flostsaga.playnetwork.co.kr' || parser.webContents.getURL() == 'https://nid.naver.com/nidlogin.login') {
      parser.webContents.executeJavaScript(`(() => {if(!document.getElementById('captchaimg'))return null; else return document.getElementById('captchaimg').src})();`, (img) => {
        if (img === null) {
          parser.webContents.executeJavaScript(`document.getElementById('id').value = '${data.id}'`)
          parser.webContents.executeJavaScript(`document.getElementById('pw').value = '${data.pw}'`)
          parser.webContents.executeJavaScript(`document.getElementsByClassName('btn_global')[0].click()`)
        }
        else {
          captcha = new BrowserWindow({ title: '로봇이 아닙니다', webPreferences: { nodeIntegration: true } })

          parser.webContents.executeJavaScript(`document.getElementById('pw').value = '${data.pw}'`)

          captcha.webContents.on('did-finish-load', () => {
            captcha.webContents.executeJavaScript(`document.getElementById('captchaImg').src='${img}'`)
          })

          captcha.loadFile('captcha.html')
        }
      })
    }

    if (parser.webContents.getURL().includes('lostsaga.playnetwork.co.kr') && (parser.webContents.getURL().includes('losaevent') || parser.webContents.getURL().includes('intro'))) {
      parser.loadURL('http://game.naver.com/game/mirror.nhn?gurl=http%3A%2F%2Flostsaga.playnetwork.co.kr%2Fmain%2Fmain.asp&gameId=P_LOSA')
    }

    if (parser.webContents.getURL() == 'http://game.naver.com/game/mirror.nhn?gurl=http%3A%2F%2Flostsaga.playnetwork.co.kr%2Fmain%2Fmain.asp&gameId=P_LOSA') {
      parser.loadURL('http://lostsaga.playnetwork.co.kr/play/playUrl.asp')
    }

    if (parser.webContents.getURL() == 'http://lostsaga.playnetwork.co.kr/play/playUrl.asp') {
      parser.webContents.executeJavaScript(`document.getElementById('playgame').href`, (playURL) => {
        startGame(playURL)
      })
    }
    ///////////////////////////////////////////////////////////////////////////////////////////////

    /**
     * Daum
     */
    if (parser.webContents.getURL() == 'https://logins.daum.net/accounts/signinform.do?url=http%3A%2F%2Fgame.daum.net%2Fbridge%2F%3Furl%3Dhttp%253A%252F%252Flostsaga.game.daum.net%252Fmain%252Fmain.asp') {
        parser.webContents.executeJavaScript(`$("#id").val('${data.id}')`)
        parser.webContents.executeJavaScript(`$("#inputPwd").val('${data.pw}')`)
        parser.webContents.executeJavaScript(`$("loginBtn").click()`)
    }

    if (parser.webContents.getURL() == 'http://game.daum.net/bridge/?url=http%3A%2F%2Flostsaga.game.daum.net%2Fmain%2Fmain.asp') {
      parser.webContents.loadURL('http://lostsaga.game.daum.net/play/playUrl.asp')
    }

    if (parser.webContents.getURL() == 'http://lostsaga.game.daum.net/play/playUrl.asp') {
      parser.webContents.executeJavaScript(`document.getElementById('playgame').href`, (playURL) => {
        startGame(playURL)
      })
    }
    ///////////////////////////////////////////////////////////////////////////////////////////////

    /**
     * MGame
     */
    if (parser.webContents.getURL() == 'http://www.mgame.com/ulnauth/login_form_big.mgame?tu=http://lostsaga.mgame.com') {
        parser.webContents.executeJavaScript(`$("#_mgid_enc").val('${data.id}')`)
        parser.webContents.executeJavaScript(`$("#_mgpwd_enc").val('${data.pw}')`)
        parser.webContents.executeJavaScript(`chkSubmit()`)
    }

    if (parser.webContents.getURL().includes('lostsaga.mgame.com') && (parser.webContents.getURL().includes('losaevent') || parser.webContents.getURL().includes('intro'))) {
      parser.webContents.executeJavaScript(`GameStart()`)
    }

    if (parser.webContents.getURL() == 'http://lostsaga.mgame.com/play/playUrl.asp') {
      parser.webContents.executeJavaScript(`document.getElementById('playgame').href`, (playURL) => {
        startGame(playURL)
      })
    }
    ///////////////////////////////////////////////////////////////////////////////////////////////

    /**
     * HanGame
     */
    if (parser.webContents.getURL() == 'https://id.hangame.com/wlogin.nhn?popup=false&adult=false&nxtURL=http%3A//lostsaga.hangame.com/main/main.asp') {
      parser.webContents.executeJavaScript(`document.getElementById('turtle2').value = '${data.id}'`)
      parser.webContents.executeJavaScript(`document.getElementById('earthworm2').value = '${data.pw}'`)
      parser.webContents.executeJavaScript(`document.getElementById('btnLoginImg').click()`)
    }

    if (parser.webContents.getURL().includes('lostsaga.hangame.com') && (parser.webContents.getURL().includes('losaevent') || parser.webContents.getURL().includes('intro'))) {
      parser.webContents.executeJavaScript(`GameStart()`)
    }

    if (parser.webContents.getURL() == 'http://lostsaga.hangame.com/play/playUrl.asp') {
      parser.webContents.executeJavaScript(`document.getElementById('playgame').href`, (playURL) => {
        startGame(playURL)
      })
    }
    ///////////////////////////////////////////////////////////////////////////////////////////////

    /**
     * Valofe
     */
    if (parser.webContents.getURL() == 'https://member.valofe.com/login/login.asp?ret=http%3A%2F%2Flostsaga-ko.valofe.com%2Fmain%2Fmain.asp') {
      parser.webContents.executeJavaScript(`document.getElementById('uid').value = '${data.id}'`)
      parser.webContents.executeJavaScript(`document.getElementById('passwd').value = '${data.pw}'`)
      parser.webContents.executeJavaScript(`document.getElementsByClassName('btnLogin')[0].click()`)
    }

    if (parser.webContents.getURL() == 'http://vfun-ko.valofe.com/bridge/?url=http%3A%2F%2Flostsaga-ko.valofe.com%2Fmain%2Fmain.asp') {
      parser.loadURL('http://lostsaga-ko.valofe.com/play/playUrl.asp')
    }

    if (parser.webContents.getURL() == 'http://lostsaga-ko.valofe.com/play/playUrl.asp') {
      parser.webContents.executeJavaScript(`document.getElementById('playgame').href`, (playURL) => {
        startGame(playURL)
      })
    }
    ///////////////////////////////////////////////////////////////////////////////////////////////
  })

  switch (data.server) {
    case 'Nexon':
      parser.loadURL('https://nxlogin.nexon.com/common/login.aspx?redirect=http%3A%2F%2Flostsaga.nexon.com%2Fmain%2Fmain.asp')
      break;

    case 'Naver':
      parser.loadURL('https://nid.naver.com/nidlogin.login?url=http%3A%2F%2Flostsaga.playnetwork.co.kr')
      break;

    case 'Daum':
      parser.loadURL('https://logins.daum.net/accounts/signinform.do?url=http%3A%2F%2Fgame.daum.net%2Fbridge%2F%3Furl%3Dhttp%253A%252F%252Flostsaga.game.daum.net%252Fmain%252Fmain.asp')
      break;

    case 'MGame':
      parser.loadURL('http://www.mgame.com/ulnauth/login_form_big.mgame?tu=http://lostsaga.mgame.com')
      break;

    case 'HanGame':
      parser.loadURL('https://id.hangame.com/wlogin.nhn?popup=false&adult=false&nxtURL=http%3A//lostsaga.hangame.com/main/main.asp')
      break;

    case 'Valofe':
      parser.loadURL('https://member.valofe.com/login/login.asp?ret=http%3A%2F%2Flostsaga-ko.valofe.com%2Fmain%2Fmain.asp')
      break;
  }

  saveId(data)
  saveServer(data)
}

function processCaptcha(data) {
  parser.webContents.executeJavaScript(`document.getElementById('chptcha').value = '${data.text}'`)
  parser.webContents.executeJavaScript(`document.getElementsByClassName('btn_global')[0].click()`)
  captcha.close()
}

function goHomePage(server) {
  switch (server) {
    case 'Nexon':
      spawn('cmd.exe', ['/c', 'start', 'http://lostsaga.nexon.com'])
      break;

    case 'Naver':
      spawn('cmd.exe', ['/c', 'start', 'http://lostsaga.playnetwork.co.kr'])
      break;

    case 'Daum':
      spawn('cmd.exe', ['/c', 'start', 'http://lostsaga.game.daum.net'])
      break;

    case 'MGame':
      spawn('cmd.exe', ['/c', 'start', 'http://lostsaga.mgame.com'])
      break;

    case 'HanGame':
      spawn('cmd.exe', ['/c', 'start', 'http://lostsaga.hangame.com'])
      break;

    case 'Valofe':
      spawn('cmd.exe', ['/c', 'start', 'http://lostsaga-ko.valofe.com'])
      break;
  }
}

function startGame(playURL) {
  console.log(playURL)
  spawn('cmd.exe', ['/c', 'start', playURL])
}

function saveId(data) {
  const file = dataPath + 'id'

  if (fs.existsSync(file)) {
    if (data.id == '') {
      fs.unlinkSync(file)
    }
    else {
      fs.writeFileSync(file, data.id)
    }
  } 
  else if (data.saveId && data.id != '') {
    fs.writeFileSync(file, data.id)
  }
}

function saveServer(data) {
  const file = dataPath + 'server'

  if (data.saveServer) {
    fs.writeFileSync(file, data.server)
  } else {
    if (fs.existsSync(file))
      fs.unlinkSync(file)
  }
}

function loadId() {
  const file = dataPath + 'id'
  if (fs.existsSync(file)) {
    let id = fs.readFileSync(file)
    win.webContents.executeJavaScript(`document.getElementById('idBox').value = '${id}'`)
    win.webContents.executeJavaScript(`document.getElementById('saveId').checked = true`) 
  }
}

function loadServer() {
  const file = dataPath + 'server'
  if (fs.existsSync(file)) {
    let server = fs.readFileSync(file)
    win.webContents.executeJavaScript(`document.getElementById('${server}').checked = true`)
    win.webContents.executeJavaScript(`document.getElementById('saveServer').checked = true`)
  }
}

ipcMain.on('login', (event, data) => {
  login(data)
})

ipcMain.on('captcha', (event, data) => {
  processCaptcha(data)
})

ipcMain.on('homepage', (event, data) => {
  goHomePage(data.server)
})

autoUpdater.on('update-downloaded', () => {
  win.webContents.executeJavaScript(`confirm('새로운 버전의 업데이트가 다운로드 되었습니다. 지금 프로그램을 재시작 하시겠습니까?')`, (confirm) => {
    if (confirm) {
      autoUpdater.quitAndInstall(true, true)
    }
  })
})

app.on('ready', createWindow)