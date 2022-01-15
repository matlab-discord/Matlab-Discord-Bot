const { SlashCommandBuilder } = require('@discordjs/builders');
const {renderInter: render} = require('../src/render');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('monline')
        .setDescription('Fetch the Matlab online link'),
    async execute(client, interaction) {
        await render(interaction, 'online.md');
    }
}