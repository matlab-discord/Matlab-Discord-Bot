require('dotenv').config();
const fs = require('fs');
const Discord = require('discord.js');
const mustache = require('mustache');
const {searchDocs, getNewestBlogEntry, getNewestVideo} = require('./src/mathworks-docs');
const why = require('./src/why');
const roll = require('./src/roll');

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
        name: 'Youtube',
        use: getNewestVideo,
        interval: 2 * 3600 * 1e3,
        template: 'youtube.md',
        errors: []
    }
];

/*
 * Function for responding with a rendered message, if the template with the given filename exists.
 */
const render = async function (msg, filename, view = {}) {
    if (templates[filename] !== undefined) {
        msg.channel.send(mustache.render(templates[filename], view));
    }
};

/*
 * Router for all commands detected via regexp.
 */
const router = [{
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
        let number = roll(tokens[2]);
        render(msg, 'rand.md', { rolled, number });
    }
}, {
    regexp: /!why/,
    use: function (msg) {
        render(msg, 'why.md', {
            result: why(),
        });
    }
}, {
    regexp: /!(.+?)( .*)?$/, // E.g. any other message (like help.md => "!help", "!help interp1", ...)
    use: function (msg, tokens) {
        const command = tokens[1];
        render(msg, command + '.md', {query: command});
    }
}];

/*
 * Discord client.
 */
const client = new Discord.Client();

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', msg => {
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
        if(/(thank|thx)/.exec(msg.content)){
            msg.reply(mustache.render(templates['thanks.md']));
        }
        else if(/(hi|hello|good|sup|what's up)/.exec(msg.content)){
            msg.reply(mustache.render(templates['greeting.md']));
        }
        else{
            msg.reply(mustache.render(templates['reply.md']));
        }
    }

    if (/(cumsum|cummin|cummax|cumtrapz|cumsec|cumprod)/.exec(msg.content) !== null) {
        msg.react("💦");
    }
    if (/[A-Za-z][\w]*\(\s*(0|-\s*\d+)\s*\)/.exec(msg.content) !== null) {
        render(msg, 'badsubscript.md');
    }
});

client.on('channelPinsUpdate', (channel, time) => {
    // Log the newest message (but it's also the newest message if you unpin!)
    channel.fetchPinnedMessages().then(msgs => {
        let iterator = msgs.entries();
        let msg = iterator.next().value[1];
        console.log(msg);
    });
});

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
