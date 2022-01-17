const { SlashCommandBuilder } = require('@discordjs/builders');
const { renderInter: render } = require('../src/render');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('askgood')
        .setDescription('How to ask a good question'),
    async execute(client, interaction) {
        await render(interaction, 'askgood.md', { username: interaction.user.displayName }, {}, true);
    },
};
