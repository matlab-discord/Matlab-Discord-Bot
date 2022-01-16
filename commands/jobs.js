const { SlashCommandBuilder } = require('@discordjs/builders');
const {renderInter: render} = require('../src/render');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('jobs')
        .setDescription('Fetch the MathWorks jobs URL.'),
    async execute(client, interaction) {
        await render(interaction, 'jobs.md');
    }
}
