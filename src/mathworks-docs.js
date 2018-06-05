let fetch = require('./fetch');

async function searchMathworksDocs(query){
    const queryURL = 'https://mathworks.com/help/search/suggest/doccenter/en/R2018a?q=' + query;
    const d = await fetch(queryURL, 'json');
    const suggestion = d.pages[0].suggestions[0];
    const title = suggestion.title.join('');
    const product = suggestion.product;
    const url = 'https://mathworks.com/help/' + suggestion.path;
    const summary = suggestion.summary.join('');
    return {
        title,
        summary,
        product,
        url
    };
}

module.exports = searchMathworksDocs;