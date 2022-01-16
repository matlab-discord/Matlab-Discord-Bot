const { SlashCommandBuilder } = require('@discordjs/builders');
const { renderInter: render } = require('../src/render');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('sonramp')
        .setDescription('Simulink onramp'),
    async execute(client, interaction) {
        await render(interaction, 'slonramp.md');
    },
};
