# Matlab-Discord-Bot

A bot for searching commands from MathWorks docs within Discord.
Allows for Octave integration through Discord chat when installed on a Linux system.   

See [help.md](https://github.com/matlab-discord/Matlab-Discord-Bot/blob/master/msg/help.md) for all commands or type `!help` in chat.

## Installation

Clone this repository (either to your PC or a host). Create a file called `.env` in the root directory, where the token of the bot has to be posted:

```
BOT_TOKEN=<your token here>
NEWS_CHANNEL_ID=<channel ID>                   # The discord chanenl ID for newest MathWorks blog posts and videos. Can leave blank.
DM_INTRO=<0 or 1>                              # If true (1) bot will send an intro message to new users who join the server.
YOUTUBE_AUTH_KEY=<Youtube authentication key>  # The Youtube authentication key used in the Youtube data api v3 for getting the last 
                                                 youtube video published on the MATLAB channel.
OWNER_ID=<Discord ID of owner>                 # The ID for the owner of the bot (You, probably!) for debugging purposes only.  
```

Start the bot:

```
node index.js
```

## Structure

Once a message is posted, all regular expressions in the `router` will be tested. If a regular expression is triggered, the function provided via `use` will be applied on the message and the `tokens` from the regular expression.

Usually the bot has to respond with a rendered message. The templates for these messages are in the [msg](https://github.com/matlab-discord/Matlab-Discord-Bot/tree/master/msg) directory.

The last regular expression is chosen in a way, that if no command applies, it will search for a template with the name of the command. This way "static" messages can be provided just by creating the template (e.g. `help.md` and `code.md`).

## Credits

Following libraries have been used:

* [cheerio](https://github.com/cheeriojs/cheerio)
* [discord.js](https://github.com/discordjs/discord.js/)
* [dotenv](https://github.com/motdotla/dotenv)
* [mustache.js](https://github.com/janl/mustache.js/)
* [request](https://github.com/request/request)
