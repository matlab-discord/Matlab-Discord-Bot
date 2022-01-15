const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('google')
        .setDescription('LMGTFY the message')
        .addStringOption(option => option
                .setName('query')
                .setDescription('Enter the search query')
                .setRequired(true)
        ),
    async execute(client, interaction) {
        const query = encodeURIComponent( interaction.options.getString('query') )
        interaction.reply(`https://www.google.com/search?q=${query}`)
    },
};