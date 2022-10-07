const { SlashCommandBuilder } = require('@discordjs/builders');

// Define the max number of messages that can be searched back through.
const MSG_SEARCH_LIM = 10;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('wrap')
        .setDescription('Wraps the message sent N messages ago in Matlab backticks ```')
        .addNumberOption((option) => option
            .setName('n_messages_ago')
            .setDescription('Message to be wrapped in ```')
            .setRequired(true)
            .setMinValue(1)
            .setMaxValue(MSG_SEARCH_LIM)),
    async execute(client, interaction) {
        const nthMessage = interaction.options.getInteger('n_messages_ago');
        let messages = await interaction.channel.messages.fetch({ limit: MSG_SEARCH_LIM});
        messages = Array.from(messages.entries(), msg => msg[1]);
        if (messages[nthMessage - 1].author.bot) {
            await interaction.reply({ content: 'You cannot wrap bot sent messages.', ephemeral: true }).catch(console.log);
            return;
        }

        const messageToBeWrapped = messages[nthMessage - 1].content;
        const codeSearchRegexp = /```(?:matlab)?(?:\nmatlab)?((\w|\s|\S)*)```/;
        if (codeSearchRegexp.exec(messageToBeWrapped)) {
            await interaction.reply({ content: 'That message is already code wrapped.', ephemeral: true }).catch(console.log);
            return;
        }

        const wrappedMessage = `\`\`\`matlab\n${messageToBeWrapped}\`\`\``;
        await interaction.reply(wrappedMessage).catch(console.log);
        // await interaction.channel.send(wrappedMessage).catch(console.log);
        // await interaction.reply({ content: 'Successfully wrapped.', ephemeral: true }).catch(console.log);
    },
};
