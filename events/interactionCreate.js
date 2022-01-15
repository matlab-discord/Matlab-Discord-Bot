const { docAutocomplete } = require('../src/mathworks-docs');

module.exports = {
	name: 'interactionCreate',
	async execute(client, interaction) {
        // Slash command interaction
        if (interaction.isCommand()) {
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

        // Doc command autocompletion interaction
        if (interaction.isAutocomplete() && interaction.commandName === "doc") {
            const defaultChoices = [{
                name:'Getting Started',
                value:'matlab/getting-started-with-matlab.html'
            }];

            const focusedValue = interaction.options.getFocused();
            if (!focusedValue) {
                await interaction.respond(defaultChoices);
                return
            }
            const searchResults = await docAutocomplete(focusedValue);
            if (!searchResults.length) {
                await interaction.respond(defaultChoices)
                return
            }
            await interaction.respond(searchResults)
        }

	},
};

