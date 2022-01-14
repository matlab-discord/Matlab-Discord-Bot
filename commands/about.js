const { SlashCommandBuilder } = require('@discordjs/builders');
const {renderInter: render} = require('../src/render');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('about')
        .setDescription('About me. Get the GitHub repo link.'),
    async execute(client, interaction) {
        await render(interaction, 'about.md');
    },
};