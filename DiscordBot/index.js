const { Client, RichEmbed, Attachment } = require('discord.js');
const bot = new Client();
const ytdl = require("ytdl-core");
const PREFIX = ';';
const version = '1.0';
const creator = 'sevos';
const ListCommands = "ping \n clear[number of messages to be deleted] \n search \n info[version,creator] \n play [youtube link, 0-4 after search command] \n search [youtube search terms] \n stop \n skip";
const Activity = "Music all day"
const ytsr = require('ytsr');
var SearchReasultsTable = [];
var servers = {};
var arr = [];

const token = 'NjM1NDg0MTQ0OTIyNTI1NzA3.XayCIg.zbgan3INaSQrcKysaV1CpjngGtk';

bot.on('ready', () => {
    console.log('This bot is online!');
    bot.user.setActivity(Activity, { type: 'PLAYING' }).catch(console.error);
})

bot.on('message', msg => {
    if (msg.content === "HELLO" || msg.content ==="hello" || msg.content === "Hello") {
        msg.reply('Hello Friend');
        msg.react('☺');
    }
    if (msg.content ==="alvanos"){
        msg.react('💩');
    }
});

bot.login(token);

bot.on('message', message => {
    if (!message.content.startsWith(PREFIX)) return;
    let args = message.content.substring(PREFIX.length).split(" ");
    switch (args[0]) {
        case "search":
            SearchReasultsTable = [];
            //console.log(SearchReasultsTable , 'here');
            //console.log(String(args));
            var ret = String(args).replace(/search/g, '');
            var ret = ret.replace(/^,/, '');
            var ret = ret.replace(/,,+/g, ' ');
            var ret = ret.replace(/,/g, ' ');
            // console.log(ret);
            if (!ret) {
                message.channel.send("You need to specify a search term!"); return;
            } else {
                let filter;

                ytsr.getFilters(ret, function (err, filters) {
                    if (err) throw err;
                    filter = filters.get('Type').find(o => o.name === 'Video');
                    ytsr.getFilters(filter.ref, function (err, filters) {
                        if (err) throw err;
                        filter = filters.get('Duration').find(o => o.name.startsWith('Short'));
                        var options = {
                            limit: 5,
                            nextpageRef: filter.ref,
                        }
                        ytsr(null, options, function (err, searchResults) {
                            if (err) throw err;
                            for (var sg = 4; sg >= 0; sg--) {
                                //console.log(searchResults.items[sg].link);
                                // message.channel.send(4 - sg + "  " + searchResults.items[sg].title+ "  " +"["+searchResults.items[sg].duration+"]");
                                SearchReasultsTable.push(searchResults.items[sg].link);
                                // console.log(searchResults.items[sg].title);
                                // console.log(SearchReasultsTable[0], 'hereeee');
                            }
                            var ch1 = "0 "+searchResults.items[4].title+" ["+searchResults.items[0].duration+"]";
                            var ch2 = "1 "+searchResults.items[3].title+" ["+searchResults.items[1].duration+"]";
                            var ch3 = "2 "+searchResults.items[2].title+" ["+searchResults.items[2].duration+"]";
                            var ch4 = "3 "+searchResults.items[1].title+" ["+searchResults.items[3].duration+"]";
                            var ch5 = "4 "+searchResults.items[0].title+" ["+searchResults.items[4].duration+"]";
                            message.channel.send(ch1+"\n"+ch2+"\n"+ch3+"\n"+ch4+"\n"+ch5);
                        });
                    });
                });
            }
            break;
        case 'ping':
            if (!message.member.roles.find(r => r.name === "Bot")) {
                message.channel.send('You do not have premission!').then(msg => msg.delete(10000));
            } else { message.reply('Pong'); }
            break;
        case 'info':
            if (args[1] === 'version') {
                message.channel.sendMessage(version);
            }
            else if (args[1] === 'creator') {
                message.channel.sendMessage(creator);
            } else {
                message.channel.sendMessage('Invalid argument.')
            }
            break;
        case 'clear':
            var x = args[1];
            if (!args[1]) return message.reply('Error, define a number of messages to be deleted.');
            if (isNaN(x)) { return message.reply('The second argument must be a number!'); } else {
                message.channel.bulkDelete(args[1]);
            }
            break;
        case 'commands':
            const embed = new RichEmbed()
                .setTitle('Commands')
                .setColor(0xFF0000)
                .addField('Version', version)
                .addField('Current Server', message.guild.name)
                .setThumbnail(message.author.avatarURL)
                .setTimestamp(message.createdAt)
                .addField('Commands', ListCommands)
                .addField('User Name', message.author.username);
            message.channel.sendEmbed(embed);
            break;
        case 'help':
            const Embed = new RichEmbed()
                .setTitle('The commands the bot responds to:')
                .addField('Commands', ListCommands);
            message.author.send(Embed);
            break;
        case 'play':
            function play(connection, message) {
                var server = servers[message.guild.id];
                server.dispatcher = connection.playStream(ytdl(server.queue[0], { filer: "audioonly" }));

                server.queue.shift();
                server.dispatcher.on("end", function () {
                    if (server.queue[0]) {
                        play(connection, message);
                    } else {
                        connection.disconnect();
                    }
                });
            }

            if (args[1] == 1 || args[1] == 2 || args[1] == 3 || args[1] == 4 || args[1] == 0) {
                //console.log(SearchReasultsTable[args[1]],'here  ');
                //console.log(args[1],'here');
                args[1] = SearchReasultsTable[args[1]];
            }


            if (!args[1]) {
                message.channel.send('You need to provide a link or a search term!');
                return;
            } else if (!ytdl.validateURL(args[1])) {
                message.channel.send('This is not a youtube link!');
                return;
            }
            ytdl.getInfo(args[1], (err, info) => {
                //console.log(info.title);
                arr.push(info.title);
            });

            if (!message.member.voiceChannel) {
                message.channel.send("You must be in a voice channel to play songs!");
                return;
            }
            if (!servers[message.guild.id]) servers[message.guild.id] = {
                queue: []

            }
            var server = servers[message.guild.id];
            server.queue.push(args[1]);
            if (!message.guild.voiceConnection) {
                message.member.voiceChannel.join().then(function (connection) {
                    play(connection, message);
                });
            }
            break;
        case "skip":
            var server = servers[message.guild.id];
            if (server.dispatcher) server.dispatcher.end();
            message.channel.send("Skipping the song ....");
            arr.shift(1);
            break;
        case "stop":
            var server = servers[message.guild.id];
            if (message.guild.voiceConnection) {
                for (var i = server.queue.length - 1; i >= 0; i--) {
                    server.queue.splice(i, 1);
                }
                server.dispatcher.end();
                message.channel.send("Stopping the Bot.");
                //console.log('stopped the queue.', arr);
            }
            arr = [];
            if (message.guild.connection) message.voiceChannel.disconnect();
            break;
        case "playlist":
            if (arr.length == 0) { message.channel.send('Empty Playlist!'); return; }
            message.channel.send(arr);
            break;
    }
});

bot.on('guildMemberAdd', member => {
    const channel = member.guild.channels.find(channel => channel.name === 'Welcome');
    if (!channel) return;
    channel.send(`Welcome to the server, ${member}, please read the rules in the rules channel.`)
});