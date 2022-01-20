const mustache = require('mustache');
const fs = require('fs');
const templates = require('../src/templates');
const router = require('../src/router');

async function updateHelpChannels(client, channel) {
    const chan_ind = client.help_channel_ids.indexOf(channel.id);

    if (client.help_channel_timers[chan_ind] == null) {
        const busy_chan_str = `${client.help_channel_names[chan_ind]}-busy`;
        channel.setName(busy_chan_str).then((newChannel) => console.log(`Changing help channel to busy, ${newChannel.name}`)).catch(console.error);
        client.help_channel_timers[chan_ind] = setTimeout(() => {
            console.log(`Changing help channel back to ${client.help_channel_names[chan_ind]}`);
            channel.setName(client.help_channel_names[chan_ind]);
            client.help_channel_timers[chan_ind] = null;
        }, 300000);
    } else {
    // This channel has a timer established already.  Clear it, then reset it
        clearTimeout(client.help_channel_timers[chan_ind]);
        client.help_channel_timers[chan_ind] = setTimeout(() => {
            console.log(`Changing help channel back to ${client.help_channel_names[chan_ind]}`);
            channel.setName(client.help_channel_names[chan_ind]);
            client.help_channel_timers[chan_ind] = null;
        }, 300000);
    }
}

async function logBotDMs(msg) {
    // Write message to log file.  appends new line
    const writeLog = function (logMsg, logType) {
    // Open a write stream for the log file. Append to the end
        const logStream = fs.createWriteStream('log.txt', { flags: 'a' });
        const theDate = new Date();
        try { // Try to write the log
            logStream.write(`${theDate.toLocaleString()}: ${logType} - ${logMsg}\n`);
        } catch (error) {
            console.log(error);
            logStream.write(`Error writing log... ${error}\n`);
        }
        // End the log
        logStream.end();
    };

    writeLog(`[${msg.author.id}, ${msg.author.username}]: ${msg.content}`, 'DM');
}

async function regexCommandRouting(client, msg) {
    let tokens;
    let commandExecuted = false;

    for (const route of router) {
        if ((tokens = route.regexp.exec(msg.content)) !== null) {
            route.use(msg, tokens, client);
            commandExecuted = true;
            break;
        }
    }

    return commandExecuted;
}

async function botMention(msg) {
    if (/(thank|thx)/.exec(msg.content)) {
        msg.reply(mustache.render(templates['thanks.md']));
    } else if (/(hi|hello|good|sup|what's up)/.exec(msg.content)) {
        msg.reply(mustache.render(templates['greeting.md']));
    } else {
        msg.reply(mustache.render(templates['reply.md']));
    }
}

async function goodBot(msg) {
    if (/(cumsum|cummin|cummax|cumtrapz|cumsec|cumprod)/.exec(msg.content) !== null) {
        await msg.react('💦');
    }
    if (/clowns?/.exec(msg.content) !== null) {
        await msg.react('🤡');
    }
}

async function spamBait(msg) {
    if (msg.channelId === process.env.SPAM_BAIT_CHANNEL_ID) {
        const muteRole = msg.member.guild.roles.cache.find(role => role.id === process.env.MUTE_ROLE_ID);
        if (!muteRole) {
            console.error('Cannot find Mute role');
        }
        msg.member.roles.add(muteRole);
    }
}

module.exports = {
    name: 'messageCreate',
    async execute(client, msg) {
        if (msg.author.bot) {
            return;
        }

        // Good bot.
        await goodBot(msg);

        // Mute bot spam bait messages
        await spamBait(msg);

        // An empty guild indicates this is a private message. Log it
        if (!msg.inGuild()) {
            await logBotDMs(msg);
        }

        const commandExecuted = await regexCommandRouting(client, msg);

        if ((!commandExecuted) && msg.mentions.users.has(client.user.id)) {
            await botMention(msg);
        }

        if ((!commandExecuted) && client.help_channel_ids.includes(msg.channel.id)) {
            await updateHelpChannels(client, msg.channel);
        }
    },
};
