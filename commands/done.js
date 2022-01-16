const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('done')
        .setDescription('Clear a help channel of its busy status.'),
    async execute(client, interaction) {
        if (!client.help_channel_ids.includes(interaction.channel.id)) {
            await interaction.reply({ content: 'This is not a help channel. Use this command in a help-channel to clear its busy status once a question is complete.', ephemeral: true });
        }

        // check if the channel is a help channel first
        const chan = interaction.channel;
        const chan_ind = client.help_channel_ids.indexOf(chan.id);

        // If the help channel is busy, clear its busy status
        clearTimeout(client.help_channel_timers[chan_ind]);
        client.help_channel_timers[chan_ind] = null;
        chan.setName(client.help_channel_names[chan_ind]);
        await interaction.reply({ content: 'Channel cleared of busy status.', ephemeral: true }).catch(console.log);
    },
};