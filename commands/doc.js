const { SlashCommandBuilder } = require('@discordjs/builders');
const { renderInter: render } = require('../src/render');
const { docAutocomplete } = require('../src/mathworks-docs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('doc')
        .setDescription('Search Mathworks documentation.')
        .addStringOption((option) => option
            .setName('query')
            .setDescription('Enter the search query')
            .setRequired(true)
            .setAutocomplete(true)),
    async execute(client, interaction) {
        const docURL = `https://mathworks.com/help/${interaction.options.getString('query')}`;
        await render(interaction, 'doc.md', { url: docURL });
    },
    async autocompleteExecute(client, interaction) {
        const defaultChoices = [{
            name: 'Getting Started',
            value: 'matlab/getting-started-with-matlab.html',
        }];

        const focusedValue = interaction.options.getFocused();
        if (!focusedValue) {
            await interaction.respond(defaultChoices).catch(console.log);
            return;
        }
        const searchResults = await docAutocomplete(focusedValue);
        if (!searchResults.length) {
            await interaction.respond(defaultChoices).catch(console.log);
            return;
        }
        await interaction.respond(searchResults).catch(console.log);
    },
};
