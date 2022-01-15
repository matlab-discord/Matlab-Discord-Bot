module.exports = {
    async slashExecute(client, interaction) {
        const command = client.commands.get(interaction.commandName);

        if (!command) return;

        try {
            await command.execute(client, interaction);
        } catch (error) {
            console.error(error);
            return interaction.reply({
                content: 'There was an error while executing this command!',
                ephemeral: true
            });
        }
    }
}