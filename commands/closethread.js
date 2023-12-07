const { SlashCommandBuilder } = require('@discordjs/builders');
const { renderInter: render } = require('../src/render');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('closethread')
        .setDescription('Close a thread in one of the help forums'),
    async execute(client, interaction) {
        const channel = interaction.channel;

        if (channel.isThread()) {
            await interaction.reply('This thread has been marked closed by the bot.');
            channel.setArchived(true); // archived
            
        }       else {
            await interaction.reply({ content: 'This channel is not a valid channel to use closeThread', ephemeral: true });
        }
            },
};