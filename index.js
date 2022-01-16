'use strict';
require('dotenv').config();
const fs = require('fs');
const { Client, Collection, Intents } = require('discord.js');
const { initCronJobs } = require('./src/cronjobs');
require('./deploy-commands');

/*
Set bot intents.
 */
const myIntents = new Intents();
myIntents.add(Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.DIRECT_MESSAGES);

const client = new Client({ partials: ['CHANNEL'], intents: myIntents });

/*
Import in bot commands
 */
client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter((file) => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.data.name, command);
}

/*
Import in bot events
 */
const eventFiles = fs.readdirSync('./events').filter((file) => file.endsWith('.js'));

for (const file of eventFiles) {
    const event = require(`./events/${file}`);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(client, ...args));
    } else {
        client.on(event.name, async (...args) => await event.execute(client, ...args));
    }
}

/*
Save bot channel ids
 */
client.help_channel_ids = JSON.parse(process.env.HELP_CHANNEL_IDS);
client.help_channel_names = JSON.parse(process.env.HELP_CHANNEL_NAMES);
client.help_channel_timers = Array(client.help_channel_ids.length).fill(null);

const clientCronJobs = () => initCronJobs(client);

client.login(process.env.BOT_TOKEN).then(clientCronJobs);
