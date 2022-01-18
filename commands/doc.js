const { SlashCommandBuilder } = require('@discordjs/builders');
const { renderInter: render } = require('../src/render');
const { docAutocomplete, searchDocs } = require('../src/mathworks-docs');

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
        let userQuery = interaction.options.getString('query');
        // If the user inputted a none autocompleted option so that there is no .html path,
        // then take that input and search the docs.
        if (!(/.*\.html/.exec(userQuery))) {
            userQuery = (await searchDocs(userQuery)).path;
        }
        const docURL = `https://mathworks.com/help/${userQuery}`;
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
