const { SlashCommandBuilder } = require('@discordjs/builders');
const {renderInter: render} = require("../src/render");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('doc')
        .setDescription('Search Mathworks documentation.')
        .addStringOption(option => option
            .setName('query')
            .setDescription('Enter the search query')
            .setRequired(true)
            .setAutocomplete(true)
        ),
    async execute(client, interaction) {
        let docURL = 'https://mathworks.com/help/' + interaction.options.getString('query');
        await render(interaction, 'doc.md', {url: docURL})
    },
};