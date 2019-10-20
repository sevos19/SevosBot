const Discord = require('discord.js');
const bot = new Discord.Client();

const token = 'NjM1NDg0MTQ0OTIyNTI1NzA3.XaxwDQ.Vx3Vr1WH0SZBhWN5XK2Zbgk5LsY';

bot.on('ready', () =>{
    console.log('This bot is online!');
})

bot.on('message', msg=>{
    if(msg.content === "HELLO"){
        msg.reply('Hello Friend');
    }
})

bot.login(token);