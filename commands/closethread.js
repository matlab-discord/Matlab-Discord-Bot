const { SlashCommandBuilder } = require('@discordjs/builders');
const { renderInter: render } = require('../src/render');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('closethread')
        .setDescription('Close a thread in one of the help forums'),
    async execute(client, interaction) {
        const channel = interaction.channel;

        if (channel instanceof TextChannel) {
            channel.setArchived(true); // archived
            await interaction.reply({ content: 'This thread has been marked closed by the bot.', ephemeral: true });
        }       else {
            await interaction.reply({ content: 'This channel is not a valid channel to use closteThread', ephemeral: true });
        }
            },
};