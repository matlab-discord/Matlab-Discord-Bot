let fetch = require('./fetch');

async function searchDocs(query) {
    const queryURL = 'https://mathworks.com/help/search/suggest/doccenter/en/R2018a?q=' + query;
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

async function getNewestTweet() {
    const d = await fetch('https://twitter.com/MATLAB');
    let id = d('.js-stream-item.stream-item.stream-item').eq(0).attr('data-item-id');
    return {
        title: id,
        url: 'https://twitter.com/MATLAB/status/' + id
    };
}

async function getNewestVideo() {
    const video = (await fetch('https://hooktube.com/api?mode=channel&id=UCgdHSFcXvkN6O3NXvif0-pA', 'json')).items[0];
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
