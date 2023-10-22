const { SlashCommandBuilder } = require('@discordjs/builders');
const { renderInter: render } = require('../src/render');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('error')
        .setDescription('Matlab error message description'),
    async execute(client, interaction) {
        await render(interaction, 'error.md', {}, { files: ['./img/error.png'] }, true);
    },
};
