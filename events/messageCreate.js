module.exports = {
	name: 'messageCreate',
	async execute(client, msg) {
        if (msg.author.bot) {
            return;
        }
        // let tokens;
        // let commandExecuted = false;
    
        // let privateMsg = false; // keep track of private messages 
    
        // // An empty guild indicates this is a private message. Log it
        // if(msg.guild === null) {
        //     // Write to log file
        //     privateMsg = true;
        //     var theMsg = util.format("[%s, %s]: %s", msg.author.id, msg.author.username, msg.content);
        //     writeLog(theMsg, "DM");
        // }
    
        // for (const route of router) {
        //     if ((tokens = route.regexp.exec(msg.content)) !== null) {
        //         route.use(msg, tokens);
        //         commandExecuted = true;
        //         break;
        //     }
        // }
        // if ((!commandExecuted) && msg.isMentioned(client.user)) {
        //     if (/(thank|thx)/.exec(msg.content)) {
        //         msg.reply(mustache.render(templates['thanks.md']));
        //     }
        //     else if (/(hi|hello|good|sup|what's up)/.exec(msg.content)) {
        //         msg.reply(mustache.render(templates['greeting.md']));
        //     }
        //     else {
        //         msg.reply(mustache.render(templates['reply.md']));
        //     }
        // }
    
        if (/(cumsum|cummin|cummax|cumtrapz|cumsec|cumprod)/.exec(msg.content) !== null) {
            await msg.react("💦");
        }
        if(/clowns?/.exec(msg.content) !== null) {
            await msg.react("🤡")
        }
    
        // // Check if one of the help channels is active. Set its status to busy
        // if((!commandExecuted) && help_channel_ids.includes(msg.channel.id)) {
        //     var chan = msg.channel;
        //     var chan_ind = help_channel_ids.indexOf(chan.id);
    
        //     if(help_channel_timers[chan_ind] == null) {
        //         var busy_chan_str = help_channel_names[chan_ind] + "-BUSY";
        //         chan.setName(busy_chan_str).then(newChannel => console.log(`Changing help channel to busy, ${newChannel.name}`)).catch(console.error); 
        //         help_channel_timers[chan_ind] = setTimeout(function() {
        //             chan.setName(help_channel_names[chan_ind]);
        //             help_channel_timers[chan_ind] = null;
        //         }, 300000);
        //     }
        //     else {
        //         // This channel has a timer established already.  Clear it, then reset it
        //         clearTimeout(help_channel_timers[chan_ind]);
        //         help_channel_timers[chan_ind] = setTimeout(function() {
        //             chan.setName(help_channel_names[chan_ind]);
        //             help_channel_timers[chan_ind] = null;
        //         }, 300000);
        //     }
    
        // }
	},
};