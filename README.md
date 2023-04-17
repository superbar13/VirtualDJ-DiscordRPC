# VirtualDJ-Metadata-DiscordRPC
VirtualDJ-Metadata-DiscordRPC is a small command line program to add the current track and artist to your Discord status and save the current track in a now-playing.txt file.

## Installation
Go to releases and download the latest version for your operating system. Extract the zip file and run the start file.
The program will not work with Discord Rich Presence before you change the client ID in the configuration file. (See Configuration).
I advise you to add the assets to your Discord application before you start the program. (See Discord Rich Presence).

## Usage
To use the program, you just need to run the start file. The program will automatically detect the current track and artist and update your Discord status and the now-playing.txt file.

## Configuration
The configuration file is located where the program is installed. You can change the following settings:
- RPC_ENABLED: Enable or disable the Discord Rich Presence (default: true)
- RPC_CLIENT_ID: The client ID of your Discord application (default: 123456789012345678, you have to change it)
- FILE_ENABLED: Enable or disable the now-playing.txt file (default: true)
- FILE_MODE: Can be process-path, vDJ-path or custom-path, depending on where you want to save the file (process-path is the path where the program is installed, vDJ-path is the path where VirtualDJ is installed in History folder and custom-path is a custom path) (default: process-path)
- FALLBACK_PATH: The fallback path for the location of VirtualDJ if the program can't find it (default: false)
- CUSTOM_FILE_PATH: The custom path where you want to save the now-playing.txt file (default: false)

## Discord Rich Presence
To use the Discord Rich Presence, you need to create a Discord application and add the Rich Presence assets.
The assets needed are:
- Small image: virtualdj
- Large image: onair

## Building
To build the program, you need to have Node.js and pkg installed.
To install pkg, run `npm install -g pkg`.
The commands to build the program are:
- `git clone https://github.com/superbar13/VirtualDJ-Metadata-DiscordRPC.git` to clone the repository
- `npm install` to install the dependencies (or if you have pnpm installed, run `pnpm install`, it's faster)
- `npm run build` to build the program
The program will be built in the dist folder.

Default build targets are:
- Windows: x64
- Linux: x64
- macOS: x64
(You can change the build targets in the package.json file)

## Dependencies
- [discord-rpc](Package used to update the Discord Rich Presence)
- [fs-extra](Package used to write the now-playing.txt file)