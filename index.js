require('dotenv').config();
const fs        = require('fs');
const Discord   = require('discord.js');
const mustache  = require('mustache');
const {searchDocs, getNewestBlogEntry, getNewestTweet, getNewestVideo} = require('./src/mathworks-docs');
const why   = require('./src/why');
const roll  = require('./src/roll');
const latex = require('./src/latex');
const exec  = require('child_process').exec; // for sys calls
const execSync  = require('child_process').execSync; // for synchronous sys calls
const util  = require('util');

// Define some universal constants
const lengthMaxBotMessages = 1000; // max message length

// Define the path variables for Realtime octave
const rt_octave_folder      = './realtime_octave';
const rt_octave_workspaces  = util.format('%s/workspaces', rt_octave_folder);
const rt_octave_out_file    = util.format('%s/bot_out.txt', rt_octave_folder);
const rt_octave_user_code   = util.format('%s/user_code.m', rt_octave_folder);
const rt_octave_printout    = util.format('%s/user_printout.png', rt_octave_folder);
const rt_octave_timeout     = 5000; // time in ms

// Load in illegal use functions for realtime octave and compile them as a regexp
var illegal_read = fs.readFileSync(util.format('%s/illegal_phrases', rt_octave_folder), 'utf8');
const illegal_use_regexp = new RegExp('(' + illegal_read.replace(/\n/g, ')|(') + ')');

/*
 * Function to read out all files in a folder.
 */
const readFiles = function (dirname, encoding = 'utf8') {
    const files = {};
    fs.readdirSync(dirname).forEach(filename => {
        files[filename] = fs.readFileSync(dirname + filename, encoding);
    });
    return files;
};

/*
 * Read template files and parse them in mustache.
 */
const templates = readFiles('./msg/');
for (let key in templates) {
    if (templates.hasOwnProperty(key)) {
        mustache.parse(templates[key]);
    }
}

/*
 * Jobs which are going to be executed every interval (in ms).
 */
const cronjobs = [
    {
        name: 'Blog',
        use: getNewestBlogEntry,
        interval: 5 * 3600 * 1e3,
        template: 'blog.md',
        errors: []
    }, {
        name: 'Twitter',
        use: getNewestTweet,
        interval: 2 * 3600 * 1e3,
        template: 'twitter.md',
        errors: []
    }, {
        name: 'Youtube',
        use: getNewestVideo,
        interval: 2 * 3600 * 1e3,
        template: 'youtube.md',
        errors: []
    }
];

/*
 * Object which is a map of command message id -> sent message id
 */
let botMessages = [];
const addBotMessage = function (msgID, channelID, sentID) {
    botMessages.push({msgID, sentID, channelID});
    if (botMessages.length > lengthMaxBotMessages) {
        botMessages = botMessages.slice(1);
    }
};
/*
 * Function for responding with a rendered message, if the template with the given filename exists.
 */
const render = async function (msg, filename, view = {}, opts = {}, deleteMsg = false) {
    if (templates[filename] !== undefined) {
        const sent = await msg.channel.send(mustache.render(templates[filename], view), opts).catch(console.log);
        if (sent !== undefined) {
		if (deleteMsg) {
			msg.delete(20).catch(console.error);
		} 
		else {
            		addBotMessage(msg.id, msg.channel.id, sent.id);
		}
        }
    }
};

/*
 * Router for all commands detected via regexp.
 */
const router = [{
    // Realtime octave
    regexp: /!oct\s*(?:```matlab)?((?:[\s\S.])*[^`])(?:```)?$/,
    use: function (msg, tokens) {

        // Grab the users commands
        var code = tokens[1];

        // Don't allow the use of this function in DM's
        if((msg.guild === null) && (msg.author.id != process.env.OWNER_ID)) {
            msg.channel.send("Use of realtime octave is not allowed in DM's.  Please visit the main channel.");
            return;
        }
        
        // Check for illegal command usage and warn against it...
        var found_illegal_match = code.match(illegal_use_regexp);
        if(found_illegal_match) {
            msg.channel.send("Someone was being naughty <@" + process.env.OWNER_ID + ">");
            return;
        }

        // Write the users code command to a file. continue execution if it works
        fs.writeFile(rt_octave_user_code, code, function(err) {

            // Check for a file write error
            if(err) {
                console.log('--------- FILE WRITE ERROR ----------------');
                console.log(err);
                msg.channel.send('Something went wrong. <@' + process.env.OWNER_ID + '>');
                return;
            }   

            // Figure out the workspace filename for this user
            var user_id = util.format('%s#%d', msg.author.username, msg.author.discriminator);
            var user_work_file  = util.format('%s/%s.mat', rt_octave_workspaces, user_id);
            
            // Format system call for octave CLI
            var cmd_format = util.format(`addpath('%s'); bot_runner('%s', '%s')`, rt_octave_folder, rt_octave_out_file, user_work_file);
            var octave_call = util.format('octave --no-gui --eval "%s"', cmd_format);

            // Call async system octave call with a timeout.  error if it exceeds
            exec(octave_call, {timeout: rt_octave_timeout}, function(err, stdout, stderr) {
                if(err) { // if there was an error
                    console.log(err); // log the error
                    msg.channel.send("Your command timed out.");
                } else { // Read the output file
                    fs.readFile(rt_octave_out_file, 'utf8', function(err, data) {
                        if (err) {
                            console.log('--------- FILE READ ERROR ----------------')
                            console.log(err);
                            console.log(rt_octave_out_file);
                            msg.channel.send('Something went wrong. <@' + process.env.OWNER_ID + '>');
                        } else { // Send the output file message

                            // Make sure it doesn't exceed the max message length before sending
                            var msg_out = util.format("```matlab\n%s```", data);
                            if(msg_out.length >= lengthMaxBotMessages) {
                                msg.channel.send("Command executed, but output is too long to display.");
                            } else {
                                msg.channel.send(util.format("```matlab\n%s```",data));
                            }
                        }
                    });
                }
            });
        }); 

    } // end function
}, { // Print realtime octave graphic figure
    regexp: /!opr$/,
    use: function (msg, tokens) {

        // Don't allow the use of this function in DM's
        if((msg.guild === null) && (msg.author.id != process.env.OWNER_ID)) {
            msg.channel.send("Use of realtime octave is not allowed in DM's.  Please visit the main channel.");
            return;
        }
        
        // Figure out the workspace filename for this user
        var user_id = util.format('%s#%d', msg.author.username, msg.author.discriminator);
        var user_work_file  = util.format('%s/%s.mat', rt_octave_workspaces, user_id);

        var cmd_format = util.format(`addpath('%s'); print_user_gcf('%s', '%s')`, rt_octave_folder, user_work_file, rt_octave_printout);
        var octave_call = util.format('octave --no-gui --eval "%s"', cmd_format);

        // Call async system octave call with a timeout.  error if it exceeds
        exec(octave_call, {timeout: rt_octave_timeout}, function(err, stdout, stderr) {
            if(err) { // if there was an error
                console.log(err); // log the error
                msg.channel.send("You don't have a graphics figure generated.");
            } else { // Read the output file
                msg.channel.send('', {files: [rt_octave_printout]});
            }
        });


    }
},  {
    regexp: /!(m|doc) (.+?)(\s.*)?$/, // E.g. if "!m interp1" or "!doc interp1"
    use: function (msg, tokens) {
        const query = tokens[2].trim();
        searchDocs(query)
            .then((result) => {
                result.toolbox = (result.product.toLowerCase() !== 'matlab') ? ` from ${result.product}` : '';
                render(msg, 'doc.md', {result, query});
            })
            .catch((error) => {
                if (error) {
                    render(msg, 'doc_error.md', {error, query});
                }
            });
    }
}, {
    regexp: /[!$]`(.+)`\$?/, // Latex parser TODO original site down :(
    use: function (msg, tokens) {
        const query = tokens[1].trim();
        latex(query).then((imgUrl) => {
            msg.channel.send('', {
                file: imgUrl
            }).then((sent) => {
                addBotMessage(msg.id, msg.channel.id, sent.id);
            }).catch(console.error);
        }).catch((error) => {
            if (error) {
                msg.channel.send('Could not parse latex.');
            }
        });
    }
}, {
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
}, {
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
      a = res;
      msg.channel.send("http://lmgtfy.com/?q="+res);
	  msg.delete(20).catch(console.error);
    }
}, {
	regexp: /(''')|('''matlab)/,
	use: function(msg) {
		var opts = {files: ['./img/backtick_highlight.png']};
        	render(msg, 'code.md', {query: 'code'}, opts, true);
	}
}, {
    regexp: /!youtube/,
    use: function (msg) {
        getNewestVideo()
            .then(result => {
                render(msg, 'youtube.md', {result});
            })
            .catch(error => {
                if (error) {
                    render(msg, 'youtube_error.md', {error})
                }
            });
    }
}, {
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
}, {
    regexp: /!cronjob/,
    use: function (msg) {
        let result = [];
        for (let cronjob of cronjobs) {
            let hours = Math.round((new Date() - cronjob.last_checked) / (3600 * 1e3) * 100) / 100;
            let interval = Math.round(cronjob.interval / (3600 * 1e3) * 100) / 100;
            result.push(`${cronjob.name} : Last checked: ${hours} hours ago, Interval: ${interval} hours, Errors: ${cronjob.errors.length}`);
        }
        result = result.join('\n\n');
        render(msg, 'cronjobs.md', {result});
    }
}, {
    regexp: /!(roll|rand)(.*)$/,
    use: function (msg, tokens) {
        let {rolled, number} = roll(tokens[2]);
        render(msg, 'rand.md', {rolled, number});
    }
}, {
    regexp: /!why/,
    use: function (msg) {
        render(msg, 'why.md', {
            result: why(),
        });
    }
}, {
	regexp: /!ask/,
	use: function (msg) {

		var _msg = "You may ask your question in one of the help channels. _*Asking if there is someone available to help is unnecessary*_. Just post your question, providing as much detail as is necessary (along with whatever code you have written so far).";
//		msg.channel.send("", {files: ['./img/dontask2ask.png']});
		msg.channel.send(_msg);
		msg.delete(20).catch(console.error);
	}
}, {
    regexp: /^!(done|close|finish|answered|exit)/, // allow users to clear the busy status of help channels
    use: function(msg) {

        // check if the channel is a help channel first
        if(help_channel_ids.includes(msg.channel.id)) {
            var chan = msg.channel;
            var timer_ind = help_channel_ids.indexOf(chan.id);
    
            // If the help channel is busy, clear its busy status
            if(help_channel_timers[timer_ind] != null) {
                clearTimeout(help_channel_timers[timer_ind]);
                help_channel_timers[timer_ind] = null;
                chan.setName(help_channel_names[timer_ind]);
                msg.channel.send("Channel is available for another question.")
                msg.delete(20).catch(console.error);
            }
            else {
                // The user executed the command in a question channel that isn't busy
                msg.channel.send("Channel is available for another question.")
                msg.delete(20).catch(console.error);
            }
    
        }
        else {
            msg.channel.send("Use this command in a help-channel to clear its busy status once a question is complete.")
        }
    }
}, {
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
                // Preferablly keep the message on to see who is looking at jobs
                delete_msg = false;
            default:
                // do nothing
        } // end switch

        // Render the message with arguments
        render(msg, command + '.md', {query: command}, opts, delete_msg);
    }
}];

/*
 * Discord client.
 */
const client = new Discord.Client();

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);

     // Setup info for the help channel timers
    help_channel_ids    = ["450928036800364546", "456342124342804481", "456342247189774338", "644823196440199179", "601495308140019742", "453522391377903636"];
    help_channel_timers = [];
    help_channel_names  = ['matlab-help-1', 'matlab-help-2', 'matlab-help-3', 'help-channel', 'simulink-help', 'botspam'];
    // Initialize an array that will hold the timers to null, and get the original name of the channels
    for(var i = 0; i < help_channel_ids.length; i++) {
        help_channel_timers[i]  = null;
        //help_channel_names[i]   = client.channels.get(help_channel_ids[i]).name;
    }

});

client.on('message', msg => {
    if (msg.author.bot) {
        return;
    }

    let tokens;
    let commandExecuted = false;



    for (const route of router) {
        if ((tokens = route.regexp.exec(msg.content)) !== null) {
            route.use(msg, tokens);
            commandExecuted = true;
            break;
        }
    }
    if ((!commandExecuted) && msg.isMentioned(client.user)) {
        if (/(thank|thx)/.exec(msg.content)) {
            msg.reply(mustache.render(templates['thanks.md']));
        }
        else if (/(hi|hello|good|sup|what's up)/.exec(msg.content)) {
            msg.reply(mustache.render(templates['greeting.md']));
        }
        else {
            msg.reply(mustache.render(templates['reply.md']));
        }
    }

    if (/(cumsum|cummin|cummax|cumtrapz|cumsec|cumprod)/.exec(msg.content) !== null) {
        msg.react("💦");
    }
    if (/[A-Za-z][\w]*\(\s*(0|-\s*\d+)\s*\)/.exec(msg.content) !== null) {
        render(msg, 'badsubscript.md');
    }

    // Check if one of the help channels is active. Set its status to busy
    if((!commandExecuted) && help_channel_ids.includes(msg.channel.id)) {
        var chan = msg.channel;
        var timer_ind = help_channel_ids.indexOf(chan.id);

        if(help_channel_timers[timer_ind] == null) {
            var busy_chan_str = msg.channel.name + "-BUSY";
            chan.setName(busy_chan_str).then(newChannel => console.log(`Changing help channel to busy, ${newChannel.name}`)).catch(console.error); 
            help_channel_timers[timer_ind] = setTimeout(function() {
                chan.setName(help_channel_names[timer_ind]);
                help_channel_timers[timer_ind] = null;
            }, 300000);
        }
        else {
            // This channel has a timer established already.  Clear it, then reset it
            clearTimeout(help_channel_timers[timer_ind]);
            help_channel_timers[timer_ind] = setTimeout(function() {
                chan.setName(help_channel_names[timer_ind]);
                help_channel_timers[timer_ind] = null;
            }, 300000);
        }

    }

});

client.on('messageDelete', async (msg) => {
    const botMessage = botMessages.find(botMessage => botMessage.msgID === msg.id);
    if (botMessage !== undefined) {
        const sent = await client.channels
            .get(botMessage.channelID)
            .fetchMessage(botMessage.sentID)
            .catch(console.log);
        if (sent !== undefined) {
            sent.delete().catch(console.log);
        }
    }
});

if (['true', '1'].includes(process.env.DM_INTRO.toLowerCase())) {
    client.on('guildMemberAdd', member => {
        member.send(mustache.render(templates['intro.md'], {}));
    });
}

/*
client.on('channelPinsUpdate', (channel, time) => {
    // Log the newest message (but it's also the newest message if you unpin!)
    channel.fetchPinnedMessages().then(msgs => {
        let iterator = msgs.entries();
        let msg = iterator.next().value[1];
        console.log(msg);
    });
});
*/

client.login(process.env.BOT_TOKEN).then(initCronjobs);

/*
 * Function to initialize cronjobs and start the interval.
 */
function initCronjobs() {
    for (let cronjob of cronjobs) {
        cronjob.use()
            .then(entry => {
                cronjob.entry = entry;
                cronjob.last_checked = new Date();
                // Run cronjob
                setInterval(() => {
                    cronjob.use()
                        .then(entry => {
                            cronjob.last_checked = new Date();
                            if (entry.title === cronjob.entry.title) {
                                return;
                            }
                            cronjob.entry = entry;
                            client.channels.get(process.env.NEWS_CHANNEL_ID).send(mustache.render(templates[cronjob.template], {result: entry}));
                        })
                        .catch(error => {
                            if (error) {
                                cronjob.errors.push(error);
                                console.log(error);
                            }
                        });
                }, cronjob.interval);
            })
            .catch(error => {
                if (error) {
                    cronjob.errors.push(error);
                    console.log(error);
                }
            });
    }
}
