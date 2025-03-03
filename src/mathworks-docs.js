const request = require('request-promise');
const DOC_VER = "R2025a";
// Enum const to differentiate between OK and FAILED responses
const RESPONSE = {
    OK: true,
    FAIL: false
}

// Private generalized query function
async function __docQuery(queryURL) {
    // Spoofing the query to get through akami firewall.... It doesn't like bot request :'(
    const response = await fetch(queryURL, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
            'Referer': 'https://www.mathworks.com/',
            'Accept': 'application/json'
        }
    });

    if (!response.ok) {
        return (
            {
                url: `HTTP error! Status: ${response.status} - ${response.statusText}`,
                response: RESPONSE.FAIL
            });
    }
    const data = await response.json(); // Correct way to parse JSON
    let _check = data.pages || data.items;
    if (!_check || _check.length === 0) {
        return ({
            url: "No information found in the response data.",
            response: RESPONSE.FAIL

        })
    }

    // Add in the response information
    data.response = RESPONSE.OK;
    return data;
}

async function docAutocomplete(query) {
    const queryURL = `https://mathworks.com/help/search/suggest/doccenter/en/${DOC_VER}?q=${encodeURIComponent(query)}`;
    const d = await __docQuery(queryURL);
    const docSuggestions = d.pages.flatMap(
        (page) => page.suggestions.map(
            (suggestion) => (
                {
                    name: `${suggestion.product} - ${(/\/([0-9a-zA-Z.]*)\.html/.exec(suggestion.path))[1]}`,
                    value: suggestion.path,
                }
            )
        )
    );
    return docSuggestions;
}

async function searchDocs(query) {
    const queryURL = `https://mathworks.com/help/search/suggest/doccenter/en/${DOC_VER}?q=${encodeURIComponent(query)}`;
    const data = await __docQuery(queryURL);
    const suggestion = data.pages[0].suggestions[0];
    return {
        title: suggestion.title.join(''),
        summary: suggestion.summary.join(''),
        product: suggestion.product,
        url: `https://mathworks.com/help/${suggestion.path}`,
        path: suggestion.path,
    };
}

async function answersAutocomplete(query) {
    const queryURL = `https://api.mathworks.com/community/v1/search?scope=matlab-answers&sort_order=relevance+desc&query=${encodeURIComponent(query)}`;
    const data = await __docQuery(queryURL);
    // Discord answer value suggestions are capped at 100 characters. Makes it so we are unable to supply the full URL. Need to chunk it and reconstruct on the other end..
    const docSuggestions = data.items.flatMap(
        (item) => {
            const url = item.url;
            const lastSlash = url.lastIndexOf('/');
            const secondLastSlash = url.lastIndexOf('/', lastSlash - 1);
            const extractedValue = secondLastSlash !== -1 ? url.slice(secondLastSlash + 1) : url;

            return {
                name: `${item.scope}: ${item.title}`,
                value: extractedValue
            }
        }
    );
    return docSuggestions;
}

async function searchAnswers(query) {
    const queryURL = `https://api.mathworks.com/community/v1/search?scope=matlab-answers&sort_order=relevance+desc&query=${encodeURIComponent(query)}`;
    const data = await __docQuery(queryURL);
    const suggestion = data.items[0]
    return {
        title: suggestion.title,
        description: suggestion.summary,
        product: suggestion.product,
        url: suggestion.url,
        description: suggestion.description,
    };
}

// Grabbing latest blog entry
async function getNewestBlogEntry() {
    const d = await (await fetch('https://blogs.mathworks.com/')).json();
    const [, , date] = /^(.*?)on (.+)$/.exec(d('.blogger-name').eq(0).text().trim());
    const a = d('.post-title > a').eq(0);
    return {
        title: a.text().trim(),
        url: a.attr('href'),
        date,
        datenum: parseDate(date),
    };
}

// Grabbing latest tweet
async function getNewestTweet() {
    // Use an HTTPS request with the twitter v2 API to grab the 20 latest tweets from the @MATLAB account.
    // Search for the newest self published tweet (no quotes, no retweets, etc)
    const latestTweet = await request.get('https://api.twitter.com/2/tweets/search/recent?query=from:MATLAB&tweet.fields=created_at,id,lang,referenced_tweets&expansions=author_id&user.fields=created_at&max_results=20', {
        json: true,
        auth: {
            bearer: process.env.TWITTER_BEARER_TOKEN,
        },
    }).then((body) => {
        // If there was an error, return JSON with "error" field
        if (!('data' in body)) {
            throw ('No tweets found in last 7 days from API request. (Account is no longer active?)');
        }

        // Look for the first non referenced tweet and return it
        for (let i = 0; i < body.data.length; i++) {
            if (!('referenced_tweets' in body.data[i])) {
                return {
                    title: body.data[i].id,
                    url: `https://twitter.com/MATLAB/status/${body.data[i].id}`,
                };
            }
        }

        // If we got this far, this means there are no original tweets to post, only retweets... throw error.
        // Kinda dumb way to handle this, but it works good 'nuff
        throw ('Account only contains retweets');
    }).catch((err) => {
        // Want to throw the other errors so that they are caught by the cronjob
        throw (err);
    });

    return latestTweet;
}

// Grabbing latest youtube video
async function getNewestVideo() {
    // Grab the google APIs token
    const token = process.env.YOUTUBE_AUTH_KEY;
    const queryURL = "https://www.googleapis.com/youtube/v3/search?key=${token}&channelId=UCgdHSFcXvkN6O3NXvif0-pA&part=snippet,id&order=date&maxResults=1";
    const response = await fetch(queryURL);
    const video = response.json().items[0];
    return {
        title: video.snippet.title,
        description: video.snippet.description,
        url: `https://youtube.com/watch?v=${video.id.videoId}`,
        date: video.snippet.publishedAt,
    };
}

function parseDate(date) {
    const currentYear = (new Date()).getFullYear().toString();
    if (!date.endsWith(currentYear)) {
        date += `, ${currentYear}`;
    }
    return Date.parse(date);
}

module.exports = {
    docAutocomplete,
    searchDocs,
    answersAutocomplete,
    searchAnswers,
    getNewestBlogEntry,
    getNewestTweet,
    getNewestVideo,
};
