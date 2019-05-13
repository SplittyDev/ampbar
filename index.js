'use strict';

// Electron
const electron = require('electron');
const {app, BrowserWindow} = electron;

// Electron/Debug
require('electron-debug')();

// Electron/Reload
require('electron-reload')(__dirname, {
	electron: require('path').join(__dirname, 'node_modules', '.bin', 'electron')
});

// Parse command-line arguments
const args = {};
const argv = process.argv.slice(2);
while (argv.length) {
	const curr = argv.shift();
	switch(curr) {
		case '-c':
		case '--config': {
			const path = argv.shift();
			args.config = path.replace('~', require('os').homedir());
			continue;
		}
		default: {
			console.error(`Unknown argument: ${curr}`);
			app.quit();
			return;
		}
	}
}

// Construct global state
global.state = {
	args,
};

// Keep window reference
let mainWindow;

function onClosed() {
	// Make window GCable
	mainWindow = null;
}

function createMainWindow() {

	// Get screen bounds
	const {x, width} = electron.screen.getPrimaryDisplay().workAreaSize;

	// Create browser window
	const win = new electron.BrowserWindow({
		x,
		y: 0,
		width,
		height: 40,
		id: "ampbar",
		title: "ampbar",
		type: "dock",
		frame: false,
	});
	// win.toggleDevTools();

	win.loadURL(`file://${__dirname}/index.html`);
	win.on('closed', onClosed);

	return win;
}

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit();
	}
});

app.on('activate', () => {
	if (!mainWindow) {
		mainWindow = createMainWindow();
	}
});

app.on('ready', () => {
	mainWindow = createMainWindow();
});
