const Discord = require('discord.js');
const client = new Discord.Client();
const searchDocs = require('./src/mathworks-docs');

const fs = require('fs');

const helpMsg = fs.readFileSync('./doc/helpMsg.md', 'utf8');

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', msg => {
    if (msg.content.startsWith('!m')) {
        const query = msg.content.substr(2).trim();
        searchDocs(query)
            .then((result) => {
                let toolbox = '';
                if(result.product.toLowerCase() !== 'matlab'){
                    toolbox = ` from *${result.product}*`;
                }
                const msgResponse = `\`${result.title}\`${toolbox}\n${result.url}`;
                msg.channel.send(msgResponse);
            })
            .catch((error) =>{
                if(error){
                    msg.channel.send('No results for: ' + query);
                }
            });
    }
    else if(msg.content.startsWith('!help')){
        msg.channel.send(helpMsg);
    }
});

client.login('NDUzNDgzNzY1NjM4MTAzMDUy.DffjgQ.afSlYBn_ZVu31gQtDKI_FV1nm4Y');