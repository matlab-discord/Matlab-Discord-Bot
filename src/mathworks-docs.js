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
    let [, , date] = /^(.+?) on (.+)$/.exec(d('.blogger-name').eq(0).text().trim());
    const a = d('.post-title > a').eq(0);
    return {
        title: a.text().trim(),
        url: a.attr('href'),
        date: date,
        datenum: parseDate(date)
    };
}

function parseDate(date){
    const currentYear = (new Date()).getFullYear().toString();
    if(!date.endsWith(currentYear)){
        date += ', ' + currentYear;
    }
    return Date.parse(date);
}

module.exports = {
    searchDocs,
    getNewestBlogEntry
};