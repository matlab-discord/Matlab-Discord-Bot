module.exports = {
    async autocompleteExecute(client, interaction) {
        const command = client.commands.get(interaction.commandName);

        if (!command) return;

        try {
            await command.autocompleteExecute(client, interaction);
        } catch (error) {
            console.error(error);
        }
    },
};
