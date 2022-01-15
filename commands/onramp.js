const { SlashCommandBuilder } = require('@discordjs/builders');
const {renderInter: render} = require('../src/render');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('onramp')
        .setDescription('Matlab onramp'),
    async execute(client, interaction) {
        await render(interaction, 'onramp.md');
    }
}