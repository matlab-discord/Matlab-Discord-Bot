const { SlashCommandBuilder } = require('@discordjs/builders');
const { renderInter: render } = require('../src/render');
const why = require('../src/why');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('why')
        .setDescription('Answer to all questions.')
        .addStringOption((option) => option
            .setName('question')
            .setDescription('What do you want to know?')
            .setRequired(true)),
    async execute(client, interaction) {
        const userQuestion = interaction.options.getString('question');
        await render(interaction, 'why.md', { question: userQuestion, result: why() });
    },
};
