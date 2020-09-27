let fetch = require('./fetch');

async function searchDocs(query) {
    const queryURL = 'https://mathworks.com/help/search/suggest/doccenter/en/R2020b?q=' + query;
    const d = await fetch(queryURL, 'json');
    const suggestion = d.pages[0].suggestions[0];
    return {
        title: suggestion.title.join(''),
        summary: suggestion.summary.join(''),
        product: suggestion.product,
        url: 'https://mathworks.com/help/' + suggestion.path
    };
}

async function getNewestBlogEntry() {
    const d = await fetch('https://blogs.mathworks.com/');
    let [, , date] = /^(.*?)on (.+)$/.exec(d('.blogger-name').eq(0).text().trim());
    const a = d('.post-title > a').eq(0);
    return {
        title: a.text().trim(),
        url: a.attr('href'),
        date: date,
        datenum: parseDate(date)
    };
}

const firstTweetIfFail = {title: '1037657952172363778', url: 'https://twitter.com/MATLAB/status/1037657952172363778'};
let firstCall = true;

async function getNewestTweet() {
    const d = await fetch('https://twitter.com/MATLAB');
    let firstTweet = d('.js-stream-item.stream-item.stream-item').eq(0);
    let id = firstTweet.attr('data-item-id');
    let username = firstTweet.find('.username.u-dir.u-textTruncate').eq(0).text().trim();

    /*
     * If tweet is not by @Matlab, return undefined which will raise an error (not the best way to do this).
     * The first call of this function will return a made up tweet if failed. So the cronjob does not crash.
     */
    if (username !== '@MATLAB') {
        if (firstCall) {
            firstCall = false;
            return firstTweetIfFail;
        }
        return undefined;
    }
    firstCall = false;
    return {
        title: id,
        url: 'https://twitter.com/MATLAB/status/' + id
    };
}

async function getNewestVideo() {
    // Grab the google APIs token 
    let token = process.env.YOUTUBE_AUTH_KEY;
    const video = (await fetch('https://www.googleapis.com/youtube/v3/search?key=' + token + '&channelId=UCgdHSFcXvkN6O3NXvif0-pA&part=snippet,id&order=date&maxResults=1', 'json')).items[0];
    return {
        title: video.snippet.title,
        description: video.snippet.description,
        url: 'https://youtube.com/watch?v=' + video.id.videoId,
        date: video.snippet.publishedAt
    }
}

function parseDate(date) {
    const currentYear = (new Date()).getFullYear().toString();
    if (!date.endsWith(currentYear)) {
        date += ', ' + currentYear;
    }
    return Date.parse(date);
}

module.exports = {
    searchDocs,
    getNewestBlogEntry,
    getNewestTweet,
    getNewestVideo
};
