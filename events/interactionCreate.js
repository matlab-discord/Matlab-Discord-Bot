const { buttonExecute } = require('./buttonInteraction');
const { autocompleteExecute } = require('./autocompleteInteraction');
const { slashExecute } = require('./slashInteraction');

module.exports = {
    name: 'interactionCreate',
    async execute(client, interaction) {
    // Route each interaction type to the proper interaction behavior

        // Slash command interaction
        if (interaction.isCommand()) {
            await slashExecute(client, interaction);
        }

        if (interaction.isAutocomplete()) {
            await autocompleteExecute(client, interaction);
        }

        if (interaction.isButton()) {
            await buttonExecute(client, interaction);
        }

    // if (interaction.isContextMenu()) {
    //
    // }
    //
    // if (interaction.isSelectMenu()) {
    //
    // }
    },
};
