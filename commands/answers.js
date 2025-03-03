const { SlashCommandBuilder } = require('@discordjs/builders');
const { renderInter: render } = require('../src/render');
const { answersAutocomplete, searchAnswers } = require('../src/mathworks-docs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('answers')
        .setDescription('Search MATLAB Answers')
        .addStringOption((option) => option
            .setName('question')
            .setDescription('Ask your question')
            .setRequired(true)
            .setAutocomplete(true)),
    async execute(client, interaction) {
        let userQuery = interaction.options.getString('question');
        // If the user inputted no autocomplete option such that there is no URL provided value,
        // then take that input and search the answers query ourselves.
        if (!userQuery.startsWith("answers")) {
            userQuery = (await searchAnswers(userQuery));
        } else {
            userQuery = {url: `https://www.mathworks.com/matlabcentral/${userQuery}`};
        }

        await render(interaction, 'doc.md', { url: userQuery.url});
    },
    async autocompleteExecute(client, interaction) {
        const defaultChoices = [{
            name: 'MATLAB Answers',
            value: 'https://www.mathworks.com/matlabcentral/answers/help',
        }];

        const focusedValue = interaction.options.getFocused();
        if (!focusedValue) {
            await interaction.respond(defaultChoices).catch(console.log);
            return;
        }
        const searchResults = await answersAutocomplete(focusedValue);
        if (!searchResults.length) {
            await interaction.respond(defaultChoices).catch(console.log);
            return;
        }

        await interaction.respond(searchResults).catch(console.log);
    },
};
