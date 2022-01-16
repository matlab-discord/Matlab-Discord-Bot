const { SlashCommandBuilder } = require('@discordjs/builders');
const { renderInter: render } = require('../src/render');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('mathelp')
        .setDescription('Instruction for how to utilize MATLAB in chat.'),
    async execute(client, interaction) {
        await render(interaction, 'mathelp.md');
    },
};
