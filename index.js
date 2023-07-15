console.log("Starting script...");

console.log("Loading modules...");
const fs = require('fs-extra');
const path = require('path');

console.log("Loading config file...");
// get config file (if it exists, if not, create it)
const configPath = path.join(path.dirname(process.execPath), 'config.json');
var config = null;
if(fs.existsSync(configPath)) {
	config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
	console.log("Config file loaded from file!");
} else {
	config = {
		"RPC_ENABLED": true,
		"RPC_CLIENT_ID": "123456789012345678",
		"FILE_ENABLED": true,
		"FILE_MODE": "process-path",
		"FALLBACK_PATH": false,
		"CUSTOM_FILE_PATH": false,
	};
	// save the config file
	try {
		fs.writeFileSync(configPath, JSON.stringify(config, null, 4));
		console.log("Config file saved and loaded!");
	} catch(err) {
		console.log("Error while saving config file: " + err);
		console.log("You can still use the script, but you won't be able to change the config file");
	}
}
console.log("Config file loaded!");

let client;
if(config.RPC_ENABLED) {
	console.log("Loading Discord RPC...");
	const DiscordRPC = require('discord-rpc');
	client = new DiscordRPC.Client({ transport: 'ipc' });
	console.log("Discord RPC loaded!");
}

// get module that automatically finds the user's home directory
const homedir = require('os').homedir();

// get the path to the Documents folder and the AppData folder
const documentsPath = path.join(homedir, 'Documents');
const appDataPath = path.join(homedir, 'AppData', 'Local');

var vDJPath = null;
// check if the new path exists, if it does, use that one and if not, use the old one
// if neither exist, we check the ".." above the current directory
// check if it contains History
if (fs.existsSync(path.join(appDataPath, 'VirtualDJ', 'History'))) {
	vDJPath = path.join(appDataPath, 'VirtualDJ');
	console.log('Using new VirtualDJ path');
} else if(fs.existsSync(path.join(documentsPath, 'VirtualDJ', 'History'))) {
	vDJPath = path.join(documentsPath, 'VirtualDJ');
	console.log('Using old VirtualDJ path');
} else {
	abovePath = path.join(path.dirname(process.execPath), '..');
	// check the name of the folder above the current directory
	// if it's "VirtualDJ", we use that one
	if(fs.existsSync(abovePath) && fs.lstatSync(abovePath).isDirectory() && path.basename(abovePath) === 'VirtualDJ') {
		vDJPath = abovePath;
		console.log('Using above VirtualDJ path (old method)');
	}
}

if(!vDJPath) {
	// if fallback path is set, use that one
	if(config.FALLBACK_PATH) {
		// check if it is a valid path
		if(fs.existsSync(config.FALLBACK_PATH)) {
			vDJPath = config.FALLBACK_PATH;
			console.log('Using fallback custom path');
		} else {
			console.log('Invalid fallback path, exiting...'); process.exit();
		}
	} else {
		// we ask the user to select the folder where VirtualDJ is installed
		// so we are in a terminal, we can use the readline module
		const readline = require('readline').createInterface({
			input: process.stdin,
			output: process.stdout
		});
		readline.question('Please enter the path to the VirtualDJ folder: ', (answer) => {
			vDJPath = path.join(answer);
			readline.close();
		});
		if(!vDJPath) {
			console.log('No VirtualDJ path found, exiting...');
			process.exit();
		} else {
			// we check if the path exists
			if(!fs.existsSync(vDJPath)) {
				console.log('Invalid path, exiting...');
				process.exit();
			} else {
				console.log('Using user-defined VirtualDJ path');
			}
		}
	}
}

let title = 'Loading...';
let artist = 'Waiting for track...';
let longtitle = 'Loading...';
let savetitle = 'Loading...';

async function fetchText(){
	try {
		fs.readFile(path.join(vDJPath, '/History/tracklist.txt'), 'utf8' , (err, data) => {
			if (err) return console.log(`Error while reading file : ${err}`);
			if(data.includes(': ')) {
				titles = data.split(': ');
				longtitle = titles[titles.length - 1].replace(`\n`, '');
			}
			if(longtitle.includes(' - ')) {
				data = longtitle.split(' - ');
				title = data[1];
				artist = data[0];
			} else {
				title = data;
				artist = 'No Artist';
			}
		});
	} catch (err) {console.log(`Error while reading file : ${err}`);}

	if (savetitle != longtitle) updating();
}

async function updating() {
	console.log("--------------------");
	console.log("New track detected, updating...");
	console.log(longtitle);

	savetitle = longtitle;
	
	if(config.FILE_ENABLED) {
		let SavePath = path.join(path.dirname(process.execPath));
		if(config.FILE_MODE == "process-path") {
			SavePath = path.join(path.dirname(process.execPath));
		} else if(config.FILE_MODE == "vDJ-path") {
			SavePath = path.join(vDJPath, 'History');
		} else if(config.FILE_MODE == "custom-path") {
			if(fs.existsSync(config.CUSTOM_FILE_PATH)) {
				SavePath = path.join(config.CUSTOM_FILE_PATH);
			} else {
				console.log('Invalid custom file path, terminating...');
				process.exit();
			}
		}
			
		console.log("Saving now-playing.txt...");
		try {
			fs.writeFile(path.join(SavePath, 'now-playing.txt'), longtitle, 'utf-8', function(err, data) {
				if (err) return console.log(err);
			});
		} catch (err) {console.log(`Error while writing file : ${err}`);}
	}

	if(config.RPC_ENABLED) {
		console.log("Setting Discord Rich Presence...");
		// apply max length to the title and artist
		let details = `🎵  ${title}`.substring(0, 128);
		let state = `👤  ${artist}`.substring(0, 128);
		try {
			await client.setActivity({
				details: details,
				state: state,
				largeImageKey: "onair",
				largeImageText: "On Air",
				smallImageKey: "virtualdj",
				smallImageText: "VirtualDJ",
				startTimestamp: new Date(),
			}).catch(err => console.log(`Error while setting activity : ${err}`));
		} catch (err) {console.log(`Error while setting activity : ${err}`);}
	}
}

async function start(){
	console.log("Starting script...");
	if(config.RPC_ENABLED) {
		console.log("Connecting to Discord...");
		try {
			await client.login({ clientId: config.RPC_CLIENT_ID });
			console.log("Discord Rich Presence has been enabled.");
		} catch (err) {console.log(`Error while connecting to Discord : ${err}`); config.RPC_ENABLED = false;}
	}

	// check if tracklist.txt exists (fs.existsSync())f
	if(fs.existsSync(path.join(vDJPath, '/History/tracklist.txt'))) {
		console.log("tracklist.txt found!");
		fetchText(); setInterval(fetchText, 2000);
	} else {
		console.log("tracklist.txt not found, exiting...");
		console.log("Please make sure that you have enabled the writeHistory option in the VirtualDJ.");
		console.log("Launch a track and wait for it to be saved in the History, then restart this script.");
		console.log("Make sure historyDelay is set to 0 in the VirtualDJ.");
		console.log("Then, restart this script.");
		process.exit();
	}
} start();