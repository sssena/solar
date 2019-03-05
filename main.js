// Modules to control application life and create native browser window
const { app, BrowserWindow, ipcMain } = require('electron');
const url = require('url');
const path = require('path');
const util = require('util');
const execFile = util.promisify( require('child_process').execFile );
const SplashScreen = require('@trodi/electron-splashscreen');

// logger
const logger = require('electron-log');
global.logger = logger;

// web3 for CRP
const Web3 = require('./modules/crp-web3');

if ( typeof web3 !== 'undefined' ) {
    global.web3 = new Web3( web3.currentProvider );
} else {
    global.web3 = new Web3();
    global.web3.setProvider( new Web3.providers.HttpProvider( 'http://localhost:8545' ));
    logger.info( 'web3 current provider: ', global.web3.currentProvider );
}

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let windows;

async function initialize() {
    createWindow();

    // we can send a loading message after splashScreen.webContents are ready.
    await windows.splashScreen.webContents.once('dom-ready', () => {
        //windows.splashScreen.webContents.openDevTools();
        windows.splashScreen.webContents.send('update', 'Building a space station...');
    });

    //await contractInitialize();
    windows.splashScreen.webContents.send('update', 'Sprinkling star powder...');

    // load the index.html of the app after initializing.
    windows.main.loadURL( url.format( {
        pathname: path.join( __dirname, 'dist/index.html' ),
        protocol: 'file:',
        slashes: true
    }), {"extraHeaders" : "pragma: no-cache\n"} ); // without cache

    // Open the DevTools.
    windows.main.webContents.openDevTools();
}

// @author. send
// @comment. run compile.js
//           need to async-await for handling error comditions.
async function contractInitialize() {
    const{ error, stdout, stderr } = await execFile('node', ['modules/contracts/cmds/compile.js'])
        .catch(( error ) => {
            logger.error( error );
            app.quit();
        });
}

// Create the browser window.
function createWindow() {
    const mainWindowOptions = {
        width: 1280,
        height: 800,
        webPreferences: {
            nodeIntegration: true
        },
        show: false
    };
    const splashWindowOptions = {
        width: 500,
        height: 500,
        backgroundColor: "white"
    };

    // DynamicSplashScreen makes actions between mainWindow-splashWindow automatically.
    // it will distroy splash screen after loading.
    windows = SplashScreen.DynamicSplashScreen = SplashScreen.initDynamicSplashScreen({
        windowOpts: mainWindowOptions,
        templateUrl: path.join( __dirname, 'src/loading.html'),
        delay: 0, // show immediately
        minVisible: 1000,
        splashScreenOpts: splashWindowOptions
    });

    // Hide menu bar. 
    // @sena: TODO: not working!!!!!
    windows.main.setMenu( null );

    // Emitted when the window is closed.
    windows.main.on('closed', () => {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        windows.main = null;
    });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', initialize);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (windows.main === null) {
        createWindow();
    }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
