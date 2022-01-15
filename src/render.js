const mustache  = require('mustache');
const templates = require('../src/templates')

const renderMsg = async function (msg, filename, view = {}, opts = {}, deleteMsg = false) {
    if (templates[filename] === undefined) {
        return
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
        return
    }
    if (hiddenSender) {
        let message = {content: mustache.render(templates[filename], view), ...opts}
        await interaction.channel.send(message)
        await interaction.reply({content:"Sent", ephemeral: true}).catch(console.log)
    } else {
        let message = {content: mustache.render(templates[filename], view), ...opts}
        await interaction.reply(message).catch(console.log);
    }
};

module.exports = {
    renderMsg,
    renderInter
};