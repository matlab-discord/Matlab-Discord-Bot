require('dotenv').config();
const fs = require('fs');
const Discord = require('discord.js');
const mustache = require('mustache');
const {searchDocs, getNewestBlogEntry, getNewestVideo} = require('./src/mathworks-docs');

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
    regexp: /!(m|doc) (.+)( .*)?$/, // E.g. if "!m interp1" or "!doc interp1"
    use: function (msg, tokens) {
        const query = tokens[2].trim();
        searchDocs(query)
            .then((result) => {
                result.toolbox = (result.product.toLowerCase() !== 'matlab') ? ` from ${result.product}` : '';
                render(msg, 'm.md', {result, query});
            })
            .catch((error) => {
                if (error) {
                    render(msg, 'm_error.md', {error, query});
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
    regexp: /!(roll|rand)(.*)$/,
    use: function (msg, tokens) {
        let number = parseInt(tokens[2]);
        if (isNaN(number)) {
            number = 6;
        }
        render(msg, 'rand.md', {
            rolled: Math.round((number - 1) * Math.random() + 1),
            number: number
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
    for (const route of router) {
        if ((tokens = route.regexp.exec(msg.content)) !== null) {
            route.use(msg, tokens);
            break;
        }
    }
    if(/(cumsum|cummin|cummax|cumtrapz|cumsec|cumprod)/.exec(msg.content) !== null){
        msg.react("💦");
    }
});

let old_entry = {};
let old_video = {};
client.login(process.env.BOT_TOKEN).then(() => {
    // Initialize old blog entry
    getNewestBlogEntry().then(entry => {
        old_entry = entry;
    }).catch(error => {
        if (error) {
            console.log(error);
        }
    });
    // Initialize old video
    getNewestVideo().then(video => {
        old_video = video;
    }).catch(error => {
        if (error) {
            console.log(error);
        }
    });
});

/*
 * Check every 5 hours for new blog posts
 */

setInterval(() => {
    getNewestBlogEntry()
        .then(entry => {
            if (old_entry.title === undefined) {
                old_entry = entry;
                return;
            }
            if (old_entry.title !== entry.title) {
                client.channels.get(process.env.NEWS_CHANNEL_ID).send(mustache.render(templates['blog.md'], {result: entry}));
            }
        })
        .catch(error => {
            if (error) {
                console.log(error);
            }
        });

}, 5 * 3600 * 1e3);

/*
 * Check every 2 hours for new videos
 */
setInterval(() => {
    getNewestVideo()
        .then(video => {
            if (old_video.title === undefined) {
                old_video = video;
                return;
            }
            if (old_video.title !== video.title) {
                client.channels.get(process.env.NEWS_CHANNEL_ID).send(mustache.render(templates['youtube.md'], {result: video}));
            }
        })
        .catch(error => {
            if (error) {
                console.log(error);
            }
        });

}, 2 * 3600 * 1e3);