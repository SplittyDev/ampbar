// Require libraries
const {remote} = require('electron');
const {readFileSync, writeFileSync, existsSync, mkdirSync, createReadStream, createWriteStream} = require('fs-extra');
const chokidar = require('chokidar');
const {join} = require('path');
const {homedir} = require('os');
const cproc = require('child_process');
const ini = require('ini');

// Get global state
const state = remote.getGlobal('global').state;

// Declare confFile path
let confFile = state.config;

// Use default config if no custom config is supplied
if (!confFile) {

	// Construct paths
	const homeDir = join(homedir(), '.config');
	const confDir = join(homeDir, 'ampbar');
	confFile = join(confDir, 'config');

	// Test whether the ampbar directory exists
	if (!existsSync(confDir)) {
		mkdirSync(confDir);
	}

	// Test whether the ampbar conf exists
	if (!existsSync(confFile)) {
		const defaultConfFile = join(__dirname, 'config');
		writeFileSync(confFile, readFileSync(defaultConfFile));
	}
}

/**
 * The current ampbar state.
 * Contains all kinds of important runtime information.
 */
const ampState = {
	intervals: [],
};

/**
 * Read the configuration file
 */
function readConfigFile() {
	return ini.parse(readFileSync(confFile, 'utf-8'));
}

/**
 * Apply basic ampbar configuration
 *
 * @param {object} conf The configuration object
 */
function applyBaseConfig(conf) {

	// Return if no base configuration exists
	if (!conf.ampbar) return;

	// Build style
	const style = `
	body {
		background: ${conf.ampbar.background || 'hsl(0,0%,90%)'};
		font-family: '${conf.ampbar.font || 'sans-serif'}', sans-serif;
		font-size: ${conf.ampbar.fontsize || '16px'};
	}
	`;

	// Apply style
	const elStyle = document.createElement('style');
	elStyle.innerText = style;
	document.head.appendChild(elStyle);
}

/**
 * Apply a specific block configuration
 *
 * @param {object} conf The configuration object
 * @param {string} key The block key
 */
function applyBlockConfig(conf, key) {

	// Patch block defaults
	const obj = Object.assign({
		script: '',
		command: '',
		content: '',
		padding: '',
		background: 'transparent',
		color: 'hsl(0,0%,90%)',
		interval: 'once',
		justify: 'center',
		gravity: 'end',
		borderless: 'false',
	}, conf[key]);

	// Create element
	const el = document.createElement('div');
	el.classList.add('block');

	// Basic styling
	let style = `
		background: ${obj.background};
		color: ${obj.color};
		justify-content: ${obj.justify};
	`.trim().split('\n').join('');

	// Borderless option
	if (obj.borderless === true) {
		style += `padding-left: .2rem; padding-right: .2rem;`;
	}

	// Padding override
	if (obj.padding) {
		style += `padding-left: ${obj.padding};`;
		style += `padding-right: ${obj.padding};`;
	}

	// Action styling
	if (Object.keys(obj).filter(x=>x.includes('/click')).length > 0) {
		el.classList.add('mod--action');
		style += `cursor: pointer;`;
	}

	// Apply style
	el.setAttribute('style', style);

	// Execution callback
	const execCommand = () => {
		if (!obj.command.trim() && !obj.script.trim() && !obj.content.trim()) return;
		if (obj.command) {
			cproc.exec(obj.command, (err, str) => {
				el.innerHTML = str;
			});
		} else if (obj.script) {
			cproc.execFile(obj.script, (err, str) => {
				el.innerHTML = str;
			});
		} else if (obj.content) {
			el.innerHTML = obj.content;
		}
	};

	// Setup interval
	if (obj.interval === 'once') {
		execCommand();
	} else if (obj.interval.match(/\d+/)) {
		const interval = parseInt(obj.interval);
		execCommand();
		ampState.intervals.push(setInterval(execCommand, interval));
	}

	// Click handler
	if (obj['command/click']) {
		el.addEventListener('click', () => {
			cproc.exec(obj['command/click'], (err, str) => {
			});
		});
	} else if (obj['script/click']) {
		el.addEventListener('click', () => {
			cproc.execFile(obj['script/click'], (err, str) => {
			});
		});
	}

	// Add block to body
	document.body.querySelector(`.layout--${obj.gravity}`).appendChild(el);
}

/**
 * Amp Up!
 * Basically loads all ampbar functionality and blocks.
 */
function ampUp() {

	// Read the configuration file
	const conf = readConfigFile();

	// Apply base configuration
	applyBaseConfig(conf);

	// Iterate over all keys
	for (const key of Object.keys(conf)) {

		// Skip ampbar config, since we already
		// applied this in `applyBasicConfig`.
		if (key === 'ampbar') continue;

		// Apply the block configuration
		applyBlockConfig(conf, key);
	}
}

// Get the ball rolling
ampUp();

// Create config file watcher
const watcher = chokidar.watch(confFile, {
	usePolling: false,
});

// Watch for file changes to enable live reloading
watcher.on('change', () => {

	// Clear intervals
	ampState.intervals.forEach(intv => clearInterval(intv));
	ampState.intervals = [];

	// Clear html
	document.querySelectorAll('.layout').forEach(elLayout => elLayout.innerHTML = '');

	// Amp up
	ampUp();
});
