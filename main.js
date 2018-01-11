const {app, BrowserWindow, webFrame} = require('electron')
const path = require('path')
const url = require('url')

require('electron-reload')(__dirname)

var win

app.on('ready', function() {
  win = new BrowserWindow({width: 1000, height: 600, backgroundColor: '#0c0c0c', resizable:true, autoHideMenuBar: true, frame: false})

  win.loadURL(`file://${__dirname}/index.html`)

  win.on('closed', () => {
    win = null
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', () => {
  if (win === null) createWindow()
})
