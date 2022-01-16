const {renderMsg: render} = require('./render')
const { searchDocs, getNewestBlogEntry, getNewestTweet, getNewestVideo } = require('./mathworks-docs');
const exec  = require('child_process').exec; // for sys calls
const execSync  = require('child_process').execSync; // for synchronous sys calls
const latex = require('../src/latex');
const request = require('request');
const fs = require("fs");
const why = require("./why");
const buildMinesweeperGrid = require("./minesweeper");

const download = function(uri, filename, callback){
    request.head(uri, function(err, res, body){
        request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
    });
};

const router = [
    {
        regexp: /^!run[\s`]/,
        use: function(msg) {
            if(!msg.inGuild()) {
                msg.channel.send("Use of in chat MATLAB is not allowed in DM's.  Please visit the main channel.");
            }
        }
    },

    {
        // Will take the last posted message and run any code found within a code block (wrapped in backticks ```)
        regexp: /^!eval(?:uate)?$/,
        use: function(msg) {
            // Define the number of messages the eval call will search back
            const MSG_SEARCH_LIM = 10;

            msg.channel.messages.fetch({ limit: MSG_SEARCH_LIM+1 }) // +1 because we account for the message that called the eval...
                .then(messages => {
                    let _old_msgs = Array.from(messages.entries()).map( item => item[1].content)

                    // Remove the first message (this is the message that called the eval)
                    _old_msgs.splice(0,1);

                    // Loop through the messages from newest to oldest, find a valid code block
                    for(let i = 0; i < _old_msgs.length; i++) {

                        let codeMsg = _old_msgs[i]; // check the message
                        let codeSearchRegexp = /```(?:matlab)?(?:\nmatlab)?((\w|\s|\S)*)(?:```)/; // regexp to parse user code between code blocks
                        let codeSearchTokens = codeMsg.match(codeSearchRegexp);
                        // Couldn't find a match.  move onto the next message (if there is one) or break out with error message
                        if(codeSearchTokens == null) { // couldn't find a match
                            if(i === _old_msgs.length-1) { // end of loop
                                msg.channel.send("Message doesn't contain a valid code formatting block. (Wrapped in \`\`\`)");
                                return;
                            }
                            continue;
                        }
                        let codeToRun = codeSearchTokens[1];
                        let run_command = `!run\`\`\`matlab\n${codeToRun}\`\`\``
                        // Run the code, then delete message immediately
                        msg.channel.send(run_command).then(msg => msg.delete(20).catch(console.error));
                        break; // break out of the loop since we found a valid message
                    }
                })
        }
    },


    {
        regexp: /!(m|doc) (.+?)(\s.*)?$/, // E.g. if "!m interp1" or "!doc interp1"
        use: function (msg, tokens) {
            const query = tokens[2].trim();
            searchDocs(query)
                .then((result) => {
                    result.toolbox = (result.product.toLowerCase() !== 'matlab') ? ` from ${result.product}` : '';
                    render(msg, 'doc.md', {url: result.url});
                })
                .catch((error) => {
                    if (error) {
                        render(msg, 'doc_error.md', {error, query});
                    }
                });
        }
    },
    {
        regexp: /[[!$](?:`+)((?:[\s\S.])*[^`])(?:`+)$/, // Latex parser
        use: function (msg, tokens) {
            const query = tokens[1].trim();
            latex(query).then((imgUrl) => {
                // Download the image from the url (this url is strange, doesn't have an extension ending) then send
                download(imgUrl, 'img/latex.png', function(){
                    msg.channel.send({content:`Input: \`${query}\``, files: ['./img/latex.png']})
                        .then()
                        .catch(console.error);
                });
            }).catch((error) => {
                if (error) {
                    msg.channel.send('Could not parse latex.');
                }
            });
        }
    },
    {
        regexp: /!blog/,
        use: function (msg) {
            getNewestBlogEntry()
                .then(result => {
                    render(msg, 'blog.md', {result});
                })
                .catch(error => {
                    if (error) {
                        render(msg, 'blog_error.md', {error})
                    }
                });
        }
    },
    {
        regexp: /^!minesweeper\s(\d+)(?:\s(\d+))?/,
        use: function(msg, tokens) {
            let grid_size = Number(tokens[1]);
            let perc_mines;
            if(tokens[2] == null) {
                perc_mines = 20; // 20 percent by default
            } else {
                perc_mines = Number(tokens[2]);
            }
            msg.channel.send(buildMinesweeperGrid(grid_size, perc_mines));
        }

    },
    {
        regexp: /^!google\s*(.*)$/,
        use: function(msg, tokens) {
            var str = tokens[1];
            var res;
            // If the user sent issued the command with no message, use the previous message in chat
            if(!str) {
                res = msg.channel.messages.array()[msg.channel.messages.size-2].content
                res = res.replace(/ /g, "+");
            }
            else {
                res = str.replace(/ /g, "+");
            }
            let a = res;
            msg.channel.send("https://lmgtfy.com/?q="+res);
            msg.delete(20).catch(console.error);
        }
    },
    {
        regexp: /((''')|('''matlab))[\S\s.]*'''/,
        use: function(msg) {
            let opts = {files: ['./img/backtick_highlight.png']};
            render(msg, 'code.md', {query: 'code'}, opts, false);
        }
    },
    {
        regexp: /!youtube/,
        use: function (msg) {
            getNewestVideo(process.env.YOUTUBE_AUTH_KEY)
                .then(result => {
                    render(msg, 'youtube.md', {result});
                })
                .catch(error => {
                    if (error) {
                        render(msg, 'youtube_error.md', {error})
                    }
                });
        }
    },
    {
        regexp: /!twitter/,
        use: function (msg) {
            getNewestTweet()
                .then(result => {
                    render(msg, 'twitter.md', {result});
                })
                .catch(error => {
                    if (error) {
                        render(msg, 'twitter_error.md', {error})
                    }
                });
        }
    },
    {
        regexp: /!why/,
        use: function (msg) {
            render(msg, 'why.md', {
                result: why(),
            });
        }
    },
    // {
    //     regexp: /^!(done|close|finish|answered|exit)/, // allow users to clear the busy status of help channels
    //     use: function(msg) {
    //
    //         // check if the channel is a help channel first
    //         if(help_channel_ids.includes(msg.channel.id)) {
    //             var chan = msg.channel;
    //             var chan_ind = help_channel_ids.indexOf(chan.id);
    //
    //             // If the help channel is busy, clear its busy status
    //             if(help_channel_timers[chan_ind] != null) {
    //                 clearTimeout(help_channel_timers[chan_ind]);
    //                 help_channel_timers[chan_ind] = null;
    //                 chan.setName(help_channel_names[chan_ind]);
    //                 msg.channel.send("Channel is available for another question.")
    //                 msg.delete(20).catch(console.error);
    //             }
    //             else {
    //                 // The user executed the command in a question channel that isn't busy
    //                 msg.channel.send("Channel is available for another question.")
    //                 msg.delete(20).catch(console.error);
    //             }
    //
    //         }
    //         else {
    //             msg.channel.send("Use this command in a help-channel to clear its busy status once a question is complete.")
    //         }
    //     }
    // },
    {
        regexp: /^!(.+?)( .*)?$/, // E.g. any other message, pass-through (like help.md => "!help", "!help interp1", ...)
        use: function (msg, tokens) {
            const command = tokens[1];

            // For an extra layer of configurability, some pass-through messages can have options (dont delete message, add file)
            var opts = {};
            var delete_msg = true;
            switch(command)  {
                case 'code':
                    // Send keyboard image with code command
                    opts = {files: ['./img/backtick_highlight.png']};
                    break;

                case 'jobs':
                case 'help':
                case 'mathelp':
                case 'octhelp':
                    // Preferablly keep the message on to see who is looking at jobs
                    delete_msg = false;
                default:
                // do nothing
            } // end switch

            // Render the message with arguments
            render(msg, command + '.md', {query: command}, opts, delete_msg);
        }
    },
    {
        regexp: /^!askgood\s*(.*)$/,   // "!askgood @user" shows some asking tips and pings the user
        use: function (msg, tokens) {
            const username = tokens[2].trim ;
            render(msg, 'askgood.md', {username});
        }
    }];

module.exports = router