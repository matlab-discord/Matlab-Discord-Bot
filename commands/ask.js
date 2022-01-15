const { SlashCommandBuilder } = require('@discordjs/builders');
const {renderInter: render} = require('../src/render');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ask')
        .setDescription('Don\'t ask to ask, just ask.'),
    async execute(client, interaction) {
        await render(interaction, 'ask.md', {}, {}, true);
    }
}