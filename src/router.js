const latex = require('./latex');
const {
    searchDocs, getNewestBlogEntry, getNewestTweet, getNewestVideo,
} = require('./mathworks-docs');
const { renderMsg: render } = require('./render');
const why = require('./why');
const buildMinesweeperGrid = require('./minesweeper');
const icoct = require('./inchat-octave');
const download = require('./download');

const router = [
    {
        regexp: /^!run[\s`]/,
        use(msg) {
            if (!msg.inGuild()) {
                msg.channel.send('Use of in chat MATLAB is not allowed in DM\'s.  Please visit the main channel.');
            }
        },
    },
    {
    // Will take the last posted message and run any code found within a code block (wrapped in backticks ```)
        regexp: /^!eval(?:uate)?$/,
        use(msg) {
            // Define the number of messages the eval call will search back
            const MSG_SEARCH_LIM = 10;

            msg.channel.messages.fetch({ limit: MSG_SEARCH_LIM + 1 }) // +1 because we account for the message that called the eval...
                .then((messages) => {
                    const _old_msgs = Array.from(messages.entries()).map((item) => item[1].content);

                    // Remove the first message (this is the message that called the eval)
                    _old_msgs.splice(0, 1);

                    // Loop through the messages from newest to oldest, find a valid code block
                    for (let i = 0; i < _old_msgs.length; i++) {
                        const codeMsg = _old_msgs[i]; // check the message
                        const codeSearchRegexp = /```(?:matlab)?(?:\nmatlab)?((\w|\s|\S)*)```/; // regexp to parse user code between code blocks
                        const codeSearchTokens = codeMsg.match(codeSearchRegexp);
                        // Couldn't find a match.  move onto the next message (if there is one) or break out with error message
                        if (codeSearchTokens == null) { // couldn't find a match
                            if (i === _old_msgs.length - 1) { // end of loop
                                msg.channel.send('Message doesn\'t contain a valid code formatting block. (Wrapped in ```)');
                                return;
                            }
                            continue;
                        }
                        const codeToRun = codeSearchTokens[1];
                        const run_command = `!run\`\`\`matlab\n${codeToRun}\`\`\``;
                        // Run the code, then delete message immediately
                        msg.channel.send(run_command).then((msg) => msg.delete(20).catch(console.error));
                        break; // break out of the loop since we found a valid message
                    }
                });
        },
    },

    {
    // Inchat octave (remove h for octhelp message)
        regexp: /^!(oct(?=[^h])|opr|oup|orun)/,
        use(msg, tokens) {
            icoct.octaveExecute(msg, tokens);
        },
    },

    {
        regexp: /!(m|doc) (.+?)(\s.*)?$/, // E.g. if "!m interp1" or "!doc interp1"
        use(msg, tokens) {
            const query = tokens[2].trim();
            searchDocs(query)
                .then((result) => {
                    result.toolbox = (result.product.toLowerCase() !== 'matlab') ? ` from ${result.product}` : '';
                    render(msg, 'doc.md', { url: result.url }).catch(console.error);
                })
                .catch((error) => {
                    if (error) {
                        render(msg, 'doc_error.md', { error, query }).catch(console.error);
                    }
                });
        },
    },
    {
        regexp: /[[!$]`+([\s\S.]*[^`])`+$/, // Latex parser
        use(msg, tokens) {
            const query = tokens[1].trim();
            latex(query).then((imgUrl) => {
                // Download the image from the url (this url is strange, doesn't have an extension ending) then send
                download(imgUrl, 'img/latex.png', () => {
                    msg.channel.send({ content: `Input: \`${query}\``, files: ['./img/latex.png'] })
                        .then()
                        .catch(console.error);
                });
            }).catch((error) => {
                if (error) {
                    msg.channel.send('Could not parse latex.');
                }
            });
        },
    },
    {
        regexp: /!blog/,
        use(msg) {
            getNewestBlogEntry()
                .then((result) => {
                    render(msg, 'blog.md', { result }).catch(console.error);
                })
                .catch((error) => {
                    if (error) {
                        render(msg, 'blog_error.md', { error }).catch(console.error);
                    }
                });
        },
    },
    {
        regexp: /^!minesweeper\s(\d+)(?:\s(\d+))?/,
        use(msg, tokens) {
            const grid_size = Number(tokens[1]);
            let perc_mines;
            if (tokens[2] == null) {
                perc_mines = 20; // 20 percent by default
            } else {
                perc_mines = Number(tokens[2]);
            }
            msg.channel.send(buildMinesweeperGrid(grid_size, perc_mines));
        },

    },
    {
        regexp: /^!google\s*(.*)$/,
        use(msg, tokens) {
            const str = tokens[1];
            let res;
            // If the user sent issued the command with no message, use the previous message in chat
            if (!str) {
                res = msg.channel.messages.array()[msg.channel.messages.size - 2].content;
                res = res.replace(/ /g, '+');
            } else {
                res = str.replace(/ /g, '+');
            }
            msg.channel.send(`https://lmgtfy.com/?q=${res}`);
            msg.delete(20).catch(console.error);
        },
    },
    {
        regexp: /((''')|('''matlab))[\S\s.]*'''/,
        use(msg) {
            const opts = { files: ['./img/backtick_highlight.png'] };
            render(msg, 'code.md', { query: 'code' }, opts, false).catch(console.error);
        },
    },
    {
        regexp: /!youtube/,
        use(msg) {
            getNewestVideo(process.env.YOUTUBE_AUTH_KEY)
                .then((result) => {
                    render(msg, 'youtube.md', { result }).catch(console.error);
                })
                .catch((error) => {
                    if (error) {
                        render(msg, 'youtube_error.md', { error }).catch(console.error);
                    }
                });
        },
    },
    {
        regexp: /!twitter/,
        use(msg) {
            getNewestTweet()
                .then((result) => {
                    render(msg, 'twitter.md', { result }).catch(console.error);
                })
                .catch((error) => {
                    if (error) {
                        render(msg, 'twitter_error.md', { error }).catch(console.error);
                    }
                });
        },
    },
    {
        regexp: /!why/,
        use(msg) {
            render(msg, 'why.md', {
                result: why(),
            }).catch(console.error);
        },
    },
    {
        regexp: /^!(done|close|finish|answered|exit)/, // allow users to clear the busy status of help channels
        use(msg, _, client) {
            if (!client.help_channel_ids.includes(msg.channel.id)) {
                msg.channel.send('Use this command in a help-channel to clear its busy status once a question is complete.');
            }

            // check if the channel is a help channel first
            const chan = msg.channel;
            const chan_ind = client.help_channel_ids.indexOf(chan.id);

            // If the help channel is busy, clear its busy status
            if (client.help_channel_ids[chan_ind] != null) {
                clearTimeout(client.help_channel_timers[chan_ind]);
                client.help_channel_timers[chan_ind] = null;
                chan.setName(client.help_channel_names[chan_ind]);
                msg.channel.send('Channel is available for another question.');
                msg.delete(20).catch(console.error);
            } else {
                // The user executed the command in a question channel that isn't busy
                msg.channel.send('Channel is available for another question.');
                msg.delete(20).catch(console.error);
            }
        },
    },
    {
        regexp: /^!(.+?)( .*)?$/, // E.g. any other message, pass-through (like help.md => "!help", "!help interp1", ...)
        use(msg, tokens) {
            const command = tokens[1];

            // For an extra layer of configurability, some pass-through messages can have options (dont delete message, add file)
            let opts = {};
            let delete_msg = true;
            switch (command) {
            case 'code':
                // Send keyboard image with code command
                opts = { files: ['./img/backtick_highlight.png'] };
                break;

            case 'jobs':
            case 'help':
            case 'mathelp':
            case 'octhelp':
                // Preferablly keep the message on to see who is looking at jobs
                delete_msg = false;
                break;
            default:
                // do nothing
            } // end switch

            // Render the message with arguments
            render(msg, `${command}.md`, { query: command }, opts, delete_msg).catch(console.error);
        },
    },
    {
        regexp: /^!askgood\s*(.*)$/, // "!askgood @user" shows some asking tips and pings the user
        use(msg, tokens) {
            const username = tokens[2].trim;
            render(msg, 'askgood.md', { username }).catch(console.error);
        },
    }];

module.exports = router;
