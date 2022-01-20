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
        // Temporary hacky fix to discord.js issue with min_value and max_value
        // Will need to update discord.js in the future to fix this issue.
        // TODO: Remove this upon updating discord.js to a version where min_value and max_value are fixed.
        if (command.data.name === 'wrap') {
            const wrapCommand = {
                name: 'wrap',
                description: 'Warps the message sent N messages ago in Matlab backticks ```',
                options: [
                    {
                        max_value: 10,
                        min_value: 1,
                        choices: undefined,
                        autocomplete: undefined,
                        type: 4,
                        name: 'n_messages_ago',
                        description: 'Message to be wrapped in ```',
                        required: true
                    }
                ],
                default_permission: undefined
            };
            commands.push(wrapCommand);
            continue;
        }

        commands.push(command.data.toJSON());

    } catch (error) {
        console.log(`Command for ${file} is not properly formatted.`);
    }
}

const rest = new REST({ version: '9' }).setToken(token);

rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands })
    .then(() => console.log('Successfully registered application commands.'))
    .catch(console.error);
