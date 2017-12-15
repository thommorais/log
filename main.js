const {app, BrowserWindow, webFrame} = require('electron')
const path = require('path')
const url = require('url')

var win

function createWindow () {
  win = new BrowserWindow({width: 1000, height: 610, backgroundColor: '#f8f8f8', resizable:true, autoHideMenuBar: true, frame: false})

  win.loadURL(`file://${__dirname}/index.html`)

  win.on('closed', () => {
    win = null
  })
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', () => {
  if (win === null) createWindow()
})
