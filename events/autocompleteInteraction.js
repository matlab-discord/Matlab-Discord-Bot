const {docAutocomplete} = require("../src/mathworks-docs");
module.exports = {
    async autocompleteExecute(client, interaction) {
        if (interaction.commandName === "doc") {
            const defaultChoices = [{
                name:'Getting Started',
                value:'matlab/getting-started-with-matlab.html'
            }];

            const focusedValue = interaction.options.getFocused();
            if (!focusedValue) {
                await interaction.respond(defaultChoices).catch(console.log)
                return
            }
            const searchResults = await docAutocomplete(focusedValue);
            if (!searchResults.length) {
                await interaction.respond(defaultChoices).catch(console.log)
                return
            }
            await interaction.respond(searchResults).catch(console.log)
        }
    }
}