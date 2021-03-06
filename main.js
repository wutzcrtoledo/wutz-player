var app = require('app');  // Module to control application life.
var BrowserWindow = require('browser-window');  // Module to create native browser window.

const ipcMain = require('electron').ipcMain;


// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
var mainWindow = null;

//var playerWindow = null;
// Quit when all windows are closed.
app.on('window-all-closed', function() {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform != 'darwin') {
    app.quit();
  }


});

ipcMain.on('setFullScreen', function(event, arg) {
  //event.returnValue = app.getAppPath();
   mainWindow.setFullScreen(true);
});
ipcMain.on('exitFullScreen', function(event, arg) {
  //event.returnValue = app.getAppPath();
   mainWindow.setFullScreen(false);
});

ipcMain.on('toogFullScreen', function(event, arg) {
  //event.returnValue = app.getAppPath();
   if (mainWindow)
           mainWindow.setFullScreen(!mainWindow.isFullScreen());

   event.returnValue = true;
});


ipcMain.on('exitAndRunInstaller', function(event, arg) {
  //event.returnValue = app.getAppPath();

  var child = require('child_process');
  child.fork("D:/WorkP/projects/electron/WutzPlayer/js/jobs/executeUpdateInstaller.js");

   // if (mainWindow)
     //      mainWindow.close();


     event.returnValue = true;
});

ipcMain.on('justClose', function(event, arg) {
  //event.returnValue = app.getAppPath();

    if (mainWindow)
           mainWindow.close();

    event.returnValue = true;
});

ipcMain.on('minimize', function(event, arg) {
  //event.returnValue = app.getAppPath();
    if (mainWindow)
           mainWindow.minimize();
    event.returnValue = true;
});



ipcMain.on('getAppPath', function(event, arg) {
  event.returnValue = app.getAppPath();
});

ipcMain.on('isDevMode', function(event, arg) {
  event.returnValue = true; //Switch to stablish dev or release version
});


//logger.setLocalItem("appPath",app.getAppPath());
// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on('ready', function() {
  // Create the browser window.
  mainWindow = new BrowserWindow({width: 1300,
                                  height: 625,
                                  frame: true ,
                                  titleBarStyle: 'customButtonsOnHover',
                                  transparent: false,
                                  'web-preferences': {'web-security': false}});

  // and load the index.html of the app.
  //mainWindow.loadURL('file://' + __dirname + '/index.html');
  mainWindow.loadURL('file://' + __dirname + '/login_reg.html');
  // mainWindow.loadURL('file://' + __dirname + '/test.html');
  // Emitted when the window is closed.
  mainWindow.on('closed', function() {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
});
