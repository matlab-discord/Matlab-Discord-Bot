const { SlashCommandBuilder } = require('@discordjs/builders');
const request = require('request');
const fs = require('fs');
const latex = require('../src/latex');

const download = function (uri, filename, callback) {
    request.head(uri, (err, res, body) => {
        request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
    });
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('latex')
        .setDescription('Format your input in a LaTeX image.')
        .addStringOption((option) => option
            .setName('input')
            .setDescription('LaTeX to be formatted.')
            .setRequired(true)),
    async execute(client, interaction) {
        const input = interaction.options.getString('input');
        latex(input).then((imgUrl) => {
            // Download the image from the url (this url is strange, doesn't have an extension ending) then send
            download(imgUrl, 'img/latex.png', () => {
                interaction.reply({ content: `Input: \`${input}\``, files: ['./img/latex.png'] });
            });
        }).catch((error) => {
            if (error) {
                interaction.reply('Could not parse latex.');
            }
        });
    },
};
