const { SlashCommandBuilder } = require('@discordjs/builders');
const { renderInter: render } = require('../src/render');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('bug')
        .setDescription('Fetch MathWorks contact link to report a bug.'),
    async execute(client, interaction) {
        await render(interaction, 'bug.md');
    },
};
