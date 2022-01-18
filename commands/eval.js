const { SlashCommandBuilder } = require('@discordjs/builders');

// Define the number of messages the eval call will search back
const MSG_SEARCH_LIM = 10;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('eval')
        .setDescription('Run the 1st codeblock found in the last 10 messages through MATLAB.'),
    async execute(client, interaction) {
        const messages = await interaction.channel.messages.fetch({ limit: MSG_SEARCH_LIM}); // +1 because we account for the message that called the eval...
        const oldMessages = Array.from(messages.entries(), item => item[1].content);

        const codeSearchRegexp = /\`\`\`(?:matlab)?(?:\nmatlab)?((\w|\s|\S)*)\`\`\`/; // regexp to parse user code between code blocks
        const matchedMessage = oldMessages.find( codeMsg => codeMsg.match(codeSearchRegexp) );

        if (!matchedMessage) {
            interaction.reply({content: 'Messages don\'t contain a valid code formatting block. (Wrapped in ```)', ephemeral: true});
            return;
        }

        const codeToRun = matchedMessage.match(codeSearchRegexp)[1];
        const run_command = `!run\`\`\`matlab\n${codeToRun}\`\`\``;
        await interaction.reply(run_command).catch(console.log);
        setTimeout(() => interaction.deleteReply(), 50 );
    },
};
