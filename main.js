const {app, BrowserWindow, webFrame} = require('electron')
const path = require('path')

if (process.argv[2] && process.argv[2] === 'dev') require('electron-reload')(__dirname)

var win

app.on('ready', function() {
  win = new BrowserWindow({
    width: 960,
    height: 600,
    backgroundColor: '#0c0c0c',
    resizable: false,
    autoHideMenuBar: true,
    frame: false,
    icon: `${__dirname}/icon.ico`
  })

  win.loadURL(`file://${__dirname}/src/index.html`)

  win.on('closed', () => {
    win = null
  })
})

app.on('window-all-closed', () => {
  process.platform !== 'darwin' && app.quit()
})

app.on('activate', () => {
  win === null && createWindow()
})
