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
        let docURL = interaction.options.getString('question');
        // If the user inputted a none autocompleted option so that there is no .html path,
        // then take that input and search the docs.
        if (!docURL.startsWith("https://www.mathworks.com")) {
            return;
        }

        await render(interaction, 'doc.md', { url: docURL });
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
