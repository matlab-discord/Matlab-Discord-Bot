# Matlab-Discord-Bot

A bot for searching commands from MathWorks docs within Discord.
Allows for Octave integration through Discord chat when installed on a Linux system.   

See [help.md](https://github.com/matlab-discord/Matlab-Discord-Bot/blob/master/msg/help.md) for all commands or type `!help` in chat.

## Installation

1. Clone this repository (either to your PC or a host).
2. Create a new copy of the `.env.example` file and rename it to `.env` in the root directory.
3. Fill in each one of the environment variables in your new `.env` file.

    - #### Environment Variables
        `BOT_TOKEN` - Discord Client Secret token from the [Developer Portal](https://discord.com/developers/applications/) for your bot application.

        `NEWS_CHANNEL_ID` - Discord channel ID for newest MathWorks blog posts and videos. This can be left blank.

        `DM_INTRO` - Set this boolean value to 1 (true) or 0 (false) to control if the bot sends an intro message to new users who join the server.

        `YOUTUBE_AUTH_KEY` - The Youtube authentication key used in the Youtube data api v3 for getting the last youtube video published on the MATLAB channel.

        `TWITTER_BEARER_TOKEN` - Twitter API OAuth 2.0 Bearer authorization token used for tweet pulling

        `OWNER_ID` - The user ID for the owner of the bot (You, probably!) for debugging purposes only.

        `GUILD_ID` - This is the "test" guild which commands are immediately registered to. Due to slash command registration, if the test guild is not listed here it will take about 1 hour for Discord to register the command globally.

        `BOT_ID` - The user ID of the bot. This is listed in the [Developer Portal](https://discord.com/developers/applications/) as "Application ID".
         
         `HELP_CHANNEL_IDS` - Array containing the help channel IDs for the bot. The `.env.example` currently contains the default Matlab Discord Server IDs but these should be replaced if your setup.

         `HELP_CHANNEL_NAMES`- Array containing the default help channel names. This is so that the bot can set the names back to these values after the channel has been left dormant for a period. 

         `SPAM_BAIT_CHANNEL_ID` - Channel ID for spam bait to prevent automatic bot spam messages from sending too many messages in the server.
   
         `MUTE_ROLE_ID` - Role ID to be added to users that send messages in the spam bait channel to prevent them from sending more messages and spamming the server.

4. Install library dependencies with `npm install`.
The following libraries have been used:
    * [cheerio](https://github.com/cheeriojs/cheerio)
    * [discord.js](https://github.com/discordjs/discord.js/)
    * [dotenv](https://github.com/motdotla/dotenv)
    * [mustache.js](https://github.com/janl/mustache.js/)
    * [request](https://github.com/request/request)
    * [request-promise](https://github.com/request/request-promise)

5. **Be sure that you are using Node 16.9 or greater.** Start the bot by running the following command.
    ```
    node index.js
    ```

## Structure

- Events such as `interactionCreate`, `messageCreate`, and `ready` are located in `./events`.

- Slash commands can be created in `./commands` using the format below.
   ```js
     const { SlashCommandBuilder } = require('@discordjs/builders');
   
     module.exports = {
         data: new SlashCommandBuilder()
             .setName('COMMAND_NAME')
             .setDescription('COMMAND_DESCRIPTION'),
         async execute(client, interaction) {
             // Command behavior
         },
     };
     ```
  
- The bot responds to commands with rendered messages. The templates for these messages are in the [msg](https://github.com/matlab-discord/Matlab-Discord-Bot/tree/master/msg) directory. These markdown files can be changed to change the messages that the bot sends. 

