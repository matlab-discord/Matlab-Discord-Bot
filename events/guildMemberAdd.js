const mustache = require('mustache');
const templates = require('../src/templates');

module.exports = {
    name: 'guildMemberAdd',
    async execute(client, member) {
        if (['true', '1'].includes(process.env.DM_INTRO.toLowerCase())) {
            member.send(mustache.render(templates['intro.md'], {}));
        }
    },
};
