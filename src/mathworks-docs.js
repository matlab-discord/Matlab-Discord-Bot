let fetch = require('./fetch');

async function searchMathworksDocs(query){
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

module.exports = searchMathworksDocs;