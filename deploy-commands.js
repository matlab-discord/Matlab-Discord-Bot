const fs = require('fs');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');

const token = process.env.BOT_TOKEN;
const clientId = process.env.BOT_ID;
const guildId = process.env.GUILD_ID;

const commands = [];
const commandFiles = fs.readdirSync('./commands').filter((file) => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    try {
        commands.push(command.data.toJSON());
    } catch (error) {
        console.log(`Command for ${file} is not properly formatted.`);
    }
}

const rest = new REST({ version: '9' }).setToken(token);

rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands })
    .then(() => console.log('Successfully registered application commands.'))
    .catch(console.error);
