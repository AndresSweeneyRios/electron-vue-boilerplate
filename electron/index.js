const { app, BrowserWindow } = require('electron')

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 600,
    webPreferences: {
      devTools: process.env.NODE_ENV === 'development',
      worldSafeExecuteJavaScript: true,
      contextIsolation: true,
    },
  })

  if (process.env.NODE_ENV !== 'development') mainWindow.loadFile('index.html')
  
  else {
    const config = require('../config')
    
    mainWindow.loadURL(`http://localhost:${config.port}`)
    mainWindow.webContents.openDevTools()
  }
}

app.whenReady().then(createWindow)
  
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
