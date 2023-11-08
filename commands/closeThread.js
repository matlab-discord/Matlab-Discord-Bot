const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('closeThread')
        .setDescription('Close a thread in one of the help forums'),
    async execute(client, interaction) {
        const channel = interaction.channel;

        if (channel instanceof TextChannel) {
            channel.setArchived(true); // archived
            interaction.reply('This thread has been marked closed.');
        }       else {
            interaction.reply('This channel is not a valid channel to use closteThread');
        }
            },
};