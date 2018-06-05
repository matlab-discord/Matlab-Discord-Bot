require('dotenv').config();
const fs = require('fs');
const Discord = require('discord.js');
const mustache = require('mustache');
const searchDocs = require('./src/mathworks-docs');

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
    regexp: /^!(m|doc) (.+)$/, // E.g. if "!m interp1" or "!doc interp1"
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
    regexp: /^!(roll|rand)(.+)$/,
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
    regexp: /^!(.+?)( .*)?$/, // E.g. any other message (like help.md => "!help", "!help interp1", ...)
    use: function (msg, tokens) {
        const query = tokens[1];
        render(msg, query + '.md', {query});
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
});

client.login(process.env.BOT_TOKEN);
