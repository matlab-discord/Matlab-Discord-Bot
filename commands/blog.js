const { SlashCommandBuilder } = require('@discordjs/builders');
const {getNewestBlogEntry} = require('../src/mathworks-docs');
const {renderInter: render} = require('../src/render');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('blog')
		.setDescription('Posts latest MathWorks blog entry.'),
	async execute(client, interaction) {
        getNewestBlogEntry()
        .then(result => {
            render(interaction, 'blog.md', {result});
        })
        .catch(error => {
            if (error) {
                render(interaction, 'blog_error.md', {error})
            }
        });
	},
};