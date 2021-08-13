#!/bin/bash
echo "updating ytdl-core, ytsr..."
cd /home/pi/Git/DiscordBot
npm install ytdl-core@latest
npm install --save ytsr
cd /home/pi/Output_Log
date +"Discord Bot Updated %d-%m-%Y %H:%M" >> DiscordBot.log
echo "Update finished."
