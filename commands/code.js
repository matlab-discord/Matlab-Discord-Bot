const { SlashCommandBuilder } = require('@discordjs/builders');
const {renderInter: render} = require('../src/render');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('code')
        .setDescription('Instructions on how to format code.'),
    async execute(client, interaction) {
        await render(interaction, 'code.md', {}, {files: ['./img/backtick.png']}, true);
    }
}