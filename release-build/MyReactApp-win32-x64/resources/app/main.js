const { app, BrowserWindow } = require('electron');
const path = require('path');

// Function to create a new browser window
function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true, // Optional, if you need remote module
    },
  });  

  // Load the React app
  mainWindow.loadFile(path.join(__dirname, 'build', 'index.html'));

  // Open the DevTools (optional).
  // mainWindow.webContents.openDevTools();

  mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': ["default-src 'self'; style-src 'self' 'unsafe-inline'; script-src 'self';"],
      }
    });
  });
}

// When Electron is ready, create a window
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
