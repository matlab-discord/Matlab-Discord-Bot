const mustache = require('mustache');
const templates = require('./templates');

const renderMsg = async function (msg, filename, view = {}, opts = {}, deleteMsg = false) {
    if (templates[filename] === undefined) {
        return;
    }
    const sent = await msg.channel.send(mustache.render(templates[filename], view), opts).catch(console.log);
    if (sent !== undefined) {
        if (deleteMsg) {
            msg.delete(20).catch(console.error);
        }
    }
};

const renderInter = async function (interaction, filename, view = {}, opts = {}, hiddenSender = false) {
    if (templates[filename] === undefined) {
        return;
    }
    if (hiddenSender) {
        const message = { content: mustache.render(templates[filename], view), ...opts };
        await interaction.channel.send(message).catch(console.log);
        await interaction.reply({ content: 'Sent anonymously.', ephemeral: true }).catch(console.log);
    } else {
        const message = { content: mustache.render(templates[filename], view), ...opts };
        await interaction.reply(message).catch(console.log);
    }
};

module.exports = {
    renderMsg,
    renderInter,
};
