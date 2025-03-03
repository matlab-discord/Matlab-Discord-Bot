const fs = require('fs');
const mustache = require('mustache');
const templates = require('./templates');
const { getNewestBlogEntry, getNewestTweet, getNewestVideo } = require('./mathworks-docs');

const cronjob_data_file = './storage/cronjob_data.json';

// const cronjobs = [
//     {
//         name: 'Blog',
//         use: getNewestBlogEntry,
//         interval: 3 * 3600 * 1e3,
//         template: 'blog.md',
//         errors: [],
//     }, {
//         name: 'Twitter',
//         use: getNewestTweet,
//         interval: 1 * 3600 * 1e3,
//         template: 'twitter.md',
//         errors: [],
//     }, {
//         name: 'Youtube',
//         use: getNewestVideo,
//         interval: 2 * 3600 * 1e3,
//         template: 'youtube.md',
//         errors: [],
//     },
// ];

// TODO - Mathworks cut us off from all the API's :'( sad day
// Twitter API is dead as well
const cronjobs = [];

if (!fs.existsSync(cronjob_data_file)) {
	console.log("Couldn't find cronjob data file, creating empty version");
	fs.writeFileSync(cronjob_data_file, "{}", "utf8");
}

const cronjob_data = JSON.parse(fs.readFileSync(cronjob_data_file, 'utf8'));

module.exports = {
    initCronJobs(client) {
        for (const cronjob of cronjobs) {
            // Check if this cronjob type has a reference in the data JSON, if not, add a blank value
            if (!cronjob_data.hasOwnProperty(cronjob.name)) {
                cronjob_data[cronjob.name] = { entry: { title: '' } };
            }

            cronjob.use()
                .then((entry) => {
                    cronjob.last_checked = new Date();
                    if (cronjob_data[cronjob.name].entry.title !== entry.title) {
                        // record the entry to the data json
                        cronjob_data[cronjob.name].entry = entry;

                        // On boot, submit the news if it's..... new
                        client.channels.fetch(process.env.NEWS_CHANNEL_ID)
                            .then((channel) => channel.send(mustache.render(templates[cronjob.template], { result: entry })));
                    }

                    // Run cronjob
                    setInterval(() => {
                        cronjob.use()
                            .then((entry) => {
                                cronjob.last_checked = new Date();
                                // The latest entry hasn't changed, just return out
                                // if (entry.title === cronjob.entry.title) {
                                if (entry.title === cronjob_data[cronjob.name].entry.title) {
                                    return;
                                }
                                cronjob_data[cronjob.name].entry = entry;
                                // Update with the newest entry and post to discord
                                cronjob.entry = entry;
                                // Write the cronjob data file out to update the last news IDS
                                fs.writeFileSync(cronjob_data_file, JSON.stringify(cronjob_data));
                                // Send the news
                                client.channels.fetch(process.env.NEWS_CHANNEL_ID)
                                    .then((channel) => channel.send(mustache.render(templates[cronjob.template], { result: entry })));
                            })
                            .catch((error) => {
                                if (error) {
                                    cronjob.errors.push(error);
                                    console.log(error);
                                }
                            });
                    }, cronjob.interval);

                    // Write the cronjob data file out to update the last news IDS
                    fs.writeFileSync(cronjob_data_file, JSON.stringify(cronjob_data));
                })
                .catch((error) => {
                    cronjob.errors.push(error);
                    console.log(error);
                });
        }
    },
};
